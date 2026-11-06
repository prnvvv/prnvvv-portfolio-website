"""One-off, re-runnable migration from the old FAISS index to the ChromaDB collection.

FAISS vectors are NOT copied: they came from a different embedding pipeline. The chunks are rebuilt
from the authoritative source JSON in data/ and embedded by ChromaDB's default embedding behaviour.
The old FAISS sidecar (vector_store/metadata.json, plain JSON - FAISS itself is not needed) is only
used to cross-check that every old chunk id exists in the new collection.

Steps: validate+ingest (upsert, idempotent) -> compare counts/ids/metadata with the old sidecar
-> run retrieval probes -> reopen the store from disk to prove persistence.

The old files are never deleted unless you pass --remove-old AND every check passed.

Usage: python scripts/migrate_faiss_to_chroma.py [--remove-old]
"""
import _bootstrap  # noqa: F401
import json
import shutil
import sys
from pathlib import Path

from app.config import BACKEND_DIR, get_settings
from app.core.logging import configure_logging
from app.rag.retriever import Retriever
from app.rag.vector_store import VectorStore
from app.services.ingestion_service import IngestionService

OLD_DIR = BACKEND_DIR / "vector_store"
PROBES = [("Explain his FitAI project.", "fitai"), ("Tell me about SSL-RUL.", "sslrul"),
          ("What technologies did he use in CropCore?", "cropcore"), ("How can I contact him?", "contact")]


def main(remove_old: bool = False) -> int:
    s = get_settings()
    configure_logging(s.debug)
    store = VectorStore(s.chroma_path, s.chroma_collection_name)
    stats = IngestionService(s, store).ingest()
    print(f"ingest: +{stats.added_chunks} -{stats.removed_chunks} unchanged_files={stats.unchanged_files} total={stats.total_chunks}")

    ok = store.ready
    sidecar = OLD_DIR / "metadata.json"
    if sidecar.exists():
        old = json.loads(sidecar.read_text(encoding="utf-8")).get("records", {})
        old_ids = {r["chunk_id"] for r in old.values()}
        new_ids = set(store.records)
        missing, extra = sorted(old_ids - new_ids), sorted(new_ids - old_ids)
        print(f"old FAISS chunks={len(old_ids)} new Chroma chunks={len(new_ids)} missing={len(missing)} new_only={len(extra)}")
        if missing:
            print("  chunks only in the old index (source data changed since it was built?):", missing[:10])
        old_meta = {r["chunk_id"]: r["metadata"] for r in old.values()}
        drift = [i for i in old_ids & new_ids
                 if any(store.records[i]["metadata"].get(k) != v for k, v in old_meta[i].items() if k not in ("chunk_total",))]
        print(f"metadata mismatches on shared chunks: {len(drift)}")
        ok = ok and not drift
    else:
        print("no old FAISS sidecar found - skipping the old-vs-new comparison")

    r = Retriever(store)
    for q, expect in PROBES:
        top = r.retrieve(q).ranked[:5]
        found = any(expect in (c.metadata["category"] + c.metadata["source_file"] + c.metadata["title"]).lower() for c in top)
        print(f"{'OK  ' if found else 'FAIL'} {q}")
        ok = ok and found

    store.close()
    again = VectorStore(s.chroma_path, s.chroma_collection_name)
    persisted = again.size == store.size > 0
    print(f"persistence after reopen: {again.size} chunks -> {'OK' if persisted else 'FAIL'}")
    ok = ok and persisted

    print("\nMIGRATION VALIDATED" if ok else "\nMIGRATION NOT VALIDATED - old index left untouched")
    if ok and remove_old and OLD_DIR.exists():
        for f in OLD_DIR.iterdir():
            if f.name != ".gitkeep":
                shutil.rmtree(f) if f.is_dir() else f.unlink()
        print(f"removed old index files in {OLD_DIR}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main("--remove-old" in sys.argv))
