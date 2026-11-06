"""Incremental ingestion: only new/changed JSON files are re-embedded (by ChromaDB).

Usage: python scripts/ingest.py
"""
import _bootstrap  # noqa: F401
import sys

from app.config import get_settings
from app.core.logging import configure_logging
from app.rag.vector_store import VectorStore
from app.services.ingestion_service import IngestionService


def main(full_rebuild: bool = False) -> int:
    settings = get_settings()
    configure_logging(settings.debug)
    store = VectorStore(settings.chroma_path, settings.chroma_collection_name)
    stats = IngestionService(settings, store).ingest(full_rebuild=full_rebuild)
    print(
        f"added {stats.added_chunks} chunks, removed {stats.removed_chunks}, "
        f"{stats.unchanged_files} files unchanged, {stats.total_chunks} chunks in collection"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
