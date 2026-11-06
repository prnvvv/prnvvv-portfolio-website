"""Builds / updates the FAISS index from backend/data (incremental or full rebuild)."""
from __future__ import annotations

import json
import logging
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone

from app.config import Settings
from app.core.exceptions import DataValidationError
from app.core.logging import log_event
from app.rag.chunker import Chunk, chunk_document
from app.rag.data_validator import validate_data_dir
from app.rag.document_loader import SourceFile, list_json_files, load_file
from app.rag.embeddings import Embedder
from app.rag.vector_store import IndexCorruptError, VectorStore

logger = logging.getLogger(__name__)


@dataclass
class IngestStats:
    added_chunks: int = 0
    removed_chunks: int = 0
    unchanged_files: int = 0
    total_chunks: int = 0


class IngestionService:
    def __init__(self, settings: Settings, embedder: Embedder, store: VectorStore):
        self.settings = settings
        self.embedder = embedder
        self.store = store

    def ingest(self, full_rebuild: bool = False) -> IngestStats:
        data_dir = self.settings.data_path
        report = validate_data_dir(data_dir)
        for w in report.warnings:
            log_event(logger, f"data warning: {w}", level=logging.WARNING)
        if not report.ok:
            raise DataValidationError("; ".join(report.errors))

        if not full_rebuild and not self.store.ready:
            try:
                self.store.load()
            except IndexCorruptError as e:
                log_event(logger, f"existing index unusable, rebuilding: {e}", level=logging.WARNING)
                full_rebuild = True
        if full_rebuild or self.store.index is None:
            self.store.reset(self.embedder.dimension)

        stats = IngestStats()
        current: dict[str, SourceFile] = {}
        for path in list_json_files(data_dir):
            sf = load_file(path, data_dir)
            current[sf.rel_path] = sf

        # deleted files
        for rel in [r for r in list(self.store.file_hashes) if r not in current]:
            stats.removed_chunks += self.store.remove_file(rel)

        # new / changed files
        pending: list[Chunk] = []
        for rel, sf in current.items():
            if self.store.file_hashes.get(rel) == sf.sha256:
                stats.unchanged_files += 1
                continue
            stats.removed_chunks += self.store.remove_file(rel)
            for doc in sf.documents:
                pending.extend(chunk_document(doc, self.settings.max_chunk_chars))
            self.store.file_hashes[rel] = sf.sha256

        if pending:
            vectors = self.embedder.encode([c.text for c in pending])
            stats.added_chunks = self.store.add_chunks(pending, vectors)

        self.store.save()
        stats.total_chunks = self.store.size
        self._write_metadata(current)
        log_event(logger, "ingestion complete", **stats.__dict__)
        return stats

    def _write_metadata(self, current: dict[str, SourceFile]) -> None:
        cats = Counter()
        docs = 0
        for sf in current.values():
            for d in sf.documents:
                cats[d.metadata["category"]] += 1
                docs += 1
        meta = {
            "categories": dict(sorted(cats.items())),
            "document_count": docs,
            "file_count": len(current),
            "chunk_count": self.store.size,
            "embedding_model": self.embedder.model_name,
            "last_ingested_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "files": {rel: sf.sha256[:12] for rel, sf in sorted(current.items())},
        }
        (self.settings.data_path / "metadata.json").write_text(
            json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
