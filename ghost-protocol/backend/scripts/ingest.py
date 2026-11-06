"""Incremental ingestion: only new/changed JSON files are re-embedded.

Usage: python scripts/ingest.py
"""
import _bootstrap  # noqa: F401
import sys

from app.config import get_settings
from app.core.logging import configure_logging
from app.rag.embeddings import Embedder
from app.rag.vector_store import VectorStore
from app.services.ingestion_service import IngestionService


def main(full_rebuild: bool = False) -> int:
    settings = get_settings()
    configure_logging(settings.debug)
    embedder = Embedder(settings.embedding_model)
    store = VectorStore(settings.index_path, settings.metadata_path, settings.embedding_model)
    stats = IngestionService(settings, embedder, store).ingest(full_rebuild=full_rebuild)
    print(
        f"added {stats.added_chunks} chunks, removed {stats.removed_chunks}, "
        f"{stats.unchanged_files} files unchanged, {stats.total_chunks} chunks in index"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
