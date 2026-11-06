"""Full rebuild: discards the existing index and re-embeds every JSON file.

Usage: python scripts/rebuild_index.py
"""
import _bootstrap  # noqa: F401
import sys

from ingest import main

if __name__ == "__main__":
    sys.exit(main(full_rebuild=True))
