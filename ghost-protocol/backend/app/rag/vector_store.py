"""FAISS vector store with a JSON metadata sidecar.

* Index: ``IndexIDMap2(IndexFlatIP)`` over L2-normalised vectors (inner product == cosine).
  ID-mapping lets us delete the vectors of a changed/removed file without a full rebuild.
* Sidecar (JSON, not pickle - nothing here needs arbitrary object deserialisation):
  records (vector id -> chunk text + metadata), per-file SHA-256 hashes, embedding model, dimension.
"""
from __future__ import annotations

import json
import os
import re
import tempfile
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import faiss
import numpy as np

from app.rag.chunker import Chunk

FORMAT_VERSION = 1


class IndexCorruptError(RuntimeError):
    pass


@dataclass
class SearchHit:
    vector_id: int
    score: float
    text: str
    metadata: dict[str, Any]


class VectorStore:
    def __init__(self, index_path: Path, metadata_path: Path, embedding_model: str, dim: int | None = None):
        self.index_path = Path(index_path)
        self.metadata_path = Path(metadata_path)
        self.embedding_model = embedding_model
        self.dim = dim
        self.index: faiss.Index | None = None
        self.records: dict[int, dict[str, Any]] = {}
        self.file_hashes: dict[str, str] = {}
        self.next_id = 0
        self._lock = threading.RLock()
        self._vocab: tuple[int, frozenset[str]] | None = None

    # ---- state ---------------------------------------------------------
    @property
    def ready(self) -> bool:
        return self.index is not None and self.index.ntotal > 0

    @property
    def size(self) -> int:
        return int(self.index.ntotal) if self.index is not None else 0

    def _new_index(self, dim: int) -> faiss.Index:
        return faiss.IndexIDMap2(faiss.IndexFlatIP(dim))

    def reset(self, dim: int) -> None:
        with self._lock:
            self.dim = dim
            self.index = self._new_index(dim)
            self.records = {}
            self.file_hashes = {}
            self.next_id = 0

    # ---- persistence ---------------------------------------------------
    def load(self) -> bool:
        """Loads index + metadata from disk. Returns False when nothing has been built yet."""
        if not self.index_path.exists() or not self.metadata_path.exists():
            return False
        with self._lock:
            try:
                meta = json.loads(self.metadata_path.read_text(encoding="utf-8"))
                index = faiss.read_index(str(self.index_path))
            except Exception as e:  # corrupted or partial files
                raise IndexCorruptError(f"cannot read vector store: {type(e).__name__}") from e
            if meta.get("version") != FORMAT_VERSION:
                raise IndexCorruptError("vector store format version mismatch; rebuild the index")
            if meta.get("embedding_model") != self.embedding_model:
                raise IndexCorruptError(
                    "index was built with a different embedding model; run scripts/rebuild_index.py"
                )
            records = {int(k): v for k, v in meta["records"].items()}
            if index.ntotal != len(records):
                raise IndexCorruptError("index and metadata are out of sync; rebuild the index")
            self.index, self.records = index, records
            self.dim = int(meta["dim"])
            self.file_hashes = dict(meta.get("file_hashes", {}))
            self.next_id = int(meta.get("next_id", max(records, default=-1) + 1))
        return True

    def save(self) -> None:
        with self._lock:
            if self.index is None:
                raise IndexCorruptError("nothing to save")
            self.index_path.parent.mkdir(parents=True, exist_ok=True)
            meta = {
                "version": FORMAT_VERSION,
                "embedding_model": self.embedding_model,
                "dim": self.dim,
                "next_id": self.next_id,
                "file_hashes": self.file_hashes,
                "records": {str(k): v for k, v in self.records.items()},
            }
            self._atomic_write(self.metadata_path, json.dumps(meta, ensure_ascii=False).encode("utf-8"))
            tmp_idx = self.index_path.with_suffix(self.index_path.suffix + ".tmp")
            faiss.write_index(self.index, str(tmp_idx))
            os.replace(tmp_idx, self.index_path)

    @staticmethod
    def _atomic_write(path: Path, data: bytes) -> None:
        fd, tmp = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
        try:
            with os.fdopen(fd, "wb") as f:
                f.write(data)
            os.replace(tmp, path)
        except BaseException:
            Path(tmp).unlink(missing_ok=True)
            raise

    # ---- mutation ------------------------------------------------------
    def add_chunks(self, chunks: list[Chunk], vectors: np.ndarray) -> int:
        if len(chunks) != len(vectors):
            raise ValueError("chunks and vectors length mismatch")
        if not chunks:
            return 0
        with self._lock:
            if self.index is None:
                self.reset(int(vectors.shape[1]))
            if vectors.shape[1] != self.dim:
                raise ValueError("embedding dimension mismatch; rebuild the index")
            ids = np.arange(self.next_id, self.next_id + len(chunks), dtype="int64")
            self.index.add_with_ids(vectors, ids)
            for vid, ch in zip(ids.tolist(), chunks):
                self.records[vid] = {"chunk_id": ch.chunk_id, "text": ch.text, "metadata": ch.metadata}
            self.next_id += len(chunks)
        return len(chunks)

    def remove_file(self, rel_path: str) -> int:
        with self._lock:
            ids = [vid for vid, r in self.records.items() if r["metadata"].get("rel_path") == rel_path]
            if ids and self.index is not None:
                self.index.remove_ids(np.array(ids, dtype="int64"))
                for vid in ids:
                    self.records.pop(vid, None)
            self.file_hashes.pop(rel_path, None)
            return len(ids)

    # ---- query ---------------------------------------------------------
    def search(self, query_vec: np.ndarray, k: int) -> list[SearchHit]:
        with self._lock:
            if self.index is None or self.index.ntotal == 0:
                return []
            k = max(1, min(k, self.index.ntotal))
            scores, ids = self.index.search(np.ascontiguousarray(query_vec, dtype="float32"), k)
            hits = []
            for score, vid in zip(scores[0].tolist(), ids[0].tolist()):
                if vid < 0:
                    continue
                rec = self.records.get(vid)
                if rec is None:  # should be impossible after load() validation
                    continue
                hits.append(SearchHit(vid, float(score), rec["text"], rec["metadata"]))
            return hits

    def documents(self) -> list[dict[str, Any]]:
        """Distinct documents currently indexed (for health/metadata/entity lookups)."""
        with self._lock:
            seen: dict[str, dict[str, Any]] = {}
            for r in self.records.values():
                md = r["metadata"]
                seen.setdefault(md["doc_id"], md)
            return list(seen.values())

    def vocabulary(self) -> frozenset[str]:
        """Lower-cased words appearing anywhere in the indexed knowledge (cached until the index changes)."""
        with self._lock:
            key = self.next_id * 1_000_003 + len(self.records)
            if self._vocab is None or self._vocab[0] != key:
                words: set[str] = set()
                for r in self.records.values():
                    for w in re.findall(r"[a-z0-9][a-z0-9+#.\-]*", r["text"].lower()):
                        w = w.strip(".-")
                        words.add(w)
                        words.update(p for p in w.split("-") if p)
                self._vocab = (key, frozenset(words))
            return self._vocab[1]
