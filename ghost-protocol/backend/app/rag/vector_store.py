"""ChromaDB vector store (persistent, cosine distance).

Embeddings are NOT produced by this project: the collection is created without an
``embedding_function`` so ChromaDB applies its own built-in default (ONNX all-MiniLM-L6-v2, run
locally by onnxruntime) to both documents (``upsert``) and queries (``query_texts``).

Chunk text and metadata are persisted in Chroma. A read-through copy (``records``) is kept in
memory (the corpus is a few hundred chunks) for the vocabulary / entity lookups and so a hit is
always resolved from one consistent snapshot. ``file_sha256`` is stored in each chunk's metadata,
which is how unchanged files are skipped on the next ingestion without any sidecar file.
"""
from __future__ import annotations

import json
import re
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import chromadb

from app.rag.chunker import Chunk

JSON_PREFIX = "__json__"      # Chroma metadata values must be scalars; lists/dicts are stored as JSON strings
HASH_KEY = "file_sha256"
UPSERT_BATCH = 64             # bounded batches keep peak memory low while embedding


class VectorStoreError(RuntimeError):
    """Chroma is unavailable, the path is unusable, or an embedding/query call failed."""


class IndexCorruptError(VectorStoreError):
    """Kept for backwards compatibility with callers that handle an unusable index."""


@dataclass
class SearchHit:
    vector_id: str
    score: float          # cosine similarity (1 - cosine distance)
    text: str
    metadata: dict[str, Any]
    distance: float = 0.0


def _encode_meta(md: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for k, v in md.items():
        if v is None:
            continue
        if isinstance(v, (str, int, float, bool)):
            out[k] = v
        else:
            out[JSON_PREFIX + k] = json.dumps(v, ensure_ascii=False)
    return out


def _decode_meta(md: dict[str, Any] | None) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for k, v in (md or {}).items():
        if k.startswith(JSON_PREFIX):
            out[k[len(JSON_PREFIX):]] = json.loads(v)
        else:
            out[k] = v
    return out


class VectorStore:
    def __init__(self, persist_dir: Path | str, collection_name: str = "portfolio_knowledge"):
        self.persist_dir = Path(persist_dir)
        self.collection_name = collection_name
        self.records: dict[str, dict[str, Any]] = {}   # chunk id -> {chunk_id, text, metadata}
        self._lock = threading.RLock()
        self._vocab: tuple[int, frozenset[str]] | None = None
        self._version = 0
        try:
            self.persist_dir.mkdir(parents=True, exist_ok=True)
            self.client = chromadb.PersistentClient(path=str(self.persist_dir))
            self.collection = self._open_collection()
        except Exception as e:
            raise VectorStoreError(f"cannot open ChromaDB at '{self.persist_dir}': {type(e).__name__}") from e
        self.load()

    def _open_collection(self):
        # No embedding_function argument: ChromaDB's default embedding behaviour applies.
        return self.client.get_or_create_collection(
            name=self.collection_name, metadata={"hnsw:space": "cosine"}
        )

    # ---- state ---------------------------------------------------------
    @property
    def ready(self) -> bool:
        return bool(self.records)

    @property
    def size(self) -> int:
        return len(self.records)

    @property
    def file_hashes(self) -> dict[str, str]:
        out: dict[str, str] = {}
        for r in self.records.values():
            md = r["metadata"]
            if md.get("rel_path") and md.get(HASH_KEY):
                out[md["rel_path"]] = md[HASH_KEY]
        return out

    def load(self) -> bool:
        """(Re)loads the in-memory snapshot from the persisted collection."""
        with self._lock:
            try:
                got = self.collection.get(include=["documents", "metadatas"])
            except Exception as e:
                raise VectorStoreError(f"cannot read collection: {type(e).__name__}") from e
            self.records = {
                i: {"chunk_id": i, "text": d, "metadata": _decode_meta(m)}
                for i, d, m in zip(got["ids"], got["documents"], got["metadatas"])
            }
            self._version += 1
            return self.ready

    def reset(self) -> None:
        """Drops and recreates the collection (used by a full rebuild)."""
        with self._lock:
            try:
                self.client.delete_collection(self.collection_name)
                self.collection = self._open_collection()
            except Exception as e:
                raise VectorStoreError(f"cannot reset collection: {type(e).__name__}") from e
            self.records = {}
            self._version += 1

    def close(self) -> None:
        try:
            from chromadb.api.shared_system_client import SharedSystemClient

            SharedSystemClient.clear_system_cache()
        except Exception:  # pragma: no cover - best effort
            pass

    def warmup(self) -> None:
        """Forces ChromaDB to load its default embedding model so the first user query is fast."""
        if self.ready:
            self.collection.query(query_texts=["warmup"], n_results=1)

    # ---- mutation ------------------------------------------------------
    def replace_file(self, rel_path: str, chunks: list[Chunk], sha256: str) -> tuple[int, int]:
        """Upserts `chunks` of one source file, then removes its stale chunks.

        Upsert-then-prune means an embedding failure leaves the old chunks intact.
        Returns (chunks written, stale chunks removed)."""
        with self._lock:
            old_ids = {i for i, r in self.records.items() if r["metadata"].get("rel_path") == rel_path}
            new_ids = {c.chunk_id for c in chunks}
            try:
                for i in range(0, len(chunks), UPSERT_BATCH):
                    batch = chunks[i:i + UPSERT_BATCH]
                    self.collection.upsert(
                        ids=[c.chunk_id for c in batch],
                        documents=[c.text for c in batch],
                        metadatas=[_encode_meta({**c.metadata, HASH_KEY: sha256}) for c in batch],
                    )
                stale = sorted(old_ids - new_ids)
                for i in range(0, len(stale), 200):
                    self.collection.delete(ids=stale[i:i + 200])
            except Exception as e:
                raise VectorStoreError(f"upsert failed: {type(e).__name__}") from e
            for i in stale:
                self.records.pop(i, None)
            for c in chunks:
                self.records[c.chunk_id] = {
                    "chunk_id": c.chunk_id, "text": c.text, "metadata": {**c.metadata, HASH_KEY: sha256},
                }
            self._version += 1
            return len(chunks), len(old_ids)

    def remove_file(self, rel_path: str) -> int:
        with self._lock:
            ids = [i for i, r in self.records.items() if r["metadata"].get("rel_path") == rel_path]
            try:
                for i in range(0, len(ids), 200):
                    self.collection.delete(ids=ids[i:i + 200])
            except Exception as e:
                raise VectorStoreError(f"delete failed: {type(e).__name__}") from e
            for i in ids:
                self.records.pop(i, None)
            self._version += 1
            return len(ids)

    # ---- query ---------------------------------------------------------
    def search(self, query: str, k: int, where: dict[str, Any] | None = None) -> list[SearchHit]:
        """Top-k chunks for `query` (Chroma embeds the query text itself). `where` filters on metadata."""
        with self._lock:
            n = len(self.records)
            if n == 0:
                return []
            try:
                res = self.collection.query(
                    query_texts=[query], n_results=max(1, min(k, n)), where=where, include=["distances"]
                )
            except Exception as e:
                raise VectorStoreError(f"query failed: {type(e).__name__}") from e
            hits: list[SearchHit] = []
            for cid, dist in zip(res["ids"][0], res["distances"][0]):
                rec = self.records.get(cid)
                if rec is None:
                    continue
                hits.append(SearchHit(cid, 1.0 - float(dist), rec["text"], rec["metadata"], float(dist)))
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
            key = self._version * 1_000_003 + len(self.records)
            if self._vocab is None or self._vocab[0] != key:
                words: set[str] = set()
                for r in self.records.values():
                    for w in re.findall(r"[a-z0-9][a-z0-9+#.\-]*", r["text"].lower()):
                        w = w.strip(".-")
                        words.add(w)
                        words.update(p for p in w.split("-") if p)
                self._vocab = (key, frozenset(words))
            return self._vocab[1]
