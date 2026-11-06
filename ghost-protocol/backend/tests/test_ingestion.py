"""JSON ingestion, chunking, ChromaDB persistence, incremental updates, rebuilds."""
from __future__ import annotations

import json
import shutil

import pytest

from app.core.exceptions import DataValidationError
from app.rag.chunker import chunk_document
from app.rag.data_validator import validate_data_dir
from app.rag.document_loader import Document, list_json_files, load_file
from app.rag.retriever import Retriever
from app.rag.vector_store import VectorStore, VectorStoreError
from app.services.ingestion_service import IngestionService
from tests.conftest import REAL_DATA, make_settings


def write_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj), encoding="utf-8")


@pytest.fixture()
def small_data(tmp_path):
    d = tmp_path / "data"
    write_json(d / "skills" / "tools.json", {
        "category": "skills", "subcategory": "tools", "source": "test",
        "items": [{"id": "t1", "name": "Docker", "note": "containers"}, {"id": "t2", "name": "Git", "note": "version control"}],
    })
    write_json(d / "projects" / "individual" / "alpha.json", {
        "category": "projects", "id": "alpha", "name": "Alpha", "source": "test",
        "description": "Alpha is a vision system.", "technologies": ["Python", "OpenCV"],
    })
    return d


@pytest.fixture()
def svc(tmp_path, small_data):
    s = make_settings(tmp_path / "idx", small_data)
    store = VectorStore(s.chroma_path, s.chroma_collection_name)
    yield IngestionService(s, store), s
    store.close()


# ---- loading / validation / chunking ----------------------------------------------
def test_real_data_validates():
    report = validate_data_dir(REAL_DATA)
    assert report.ok, report.errors
    assert report.files_checked >= 30


def test_loader_one_document_per_item_and_metadata(small_data):
    sf = load_file(small_data / "skills" / "tools.json", small_data)
    assert [d.metadata["title"] for d in sf.documents] == ["Docker", "Git"]
    md = sf.documents[0].metadata
    assert md["category"] == "skills" and md["source_file"] == "tools.json" and md["rel_path"] == "skills/tools.json"
    assert sf.documents[0].text.startswith("[Skills] Docker")


def test_loader_single_mode_keeps_one_document(tmp_path):
    d = tmp_path / "data"
    write_json(d / "x.json", {"category": "education", "subcategory": "certs", "document_mode": "single", "source": "t",
                              "items": [{"id": "a", "title": "Cert A"}, {"id": "b", "title": "Cert B"}]})
    sf = load_file(d / "x.json", d)
    assert len(sf.documents) == 1 and "Cert A" in sf.documents[0].text and "Cert B" in sf.documents[0].text


def test_metadata_json_is_not_ingested():
    assert "metadata.json" not in {p.name for p in list_json_files(REAL_DATA)}


def test_validator_rejects_bad_files(tmp_path):
    d = tmp_path / "d"
    write_json(d / "no_category.json", {"source": "x"})
    write_json(d / "secret.json", {"category": "c", "source": "x", "note": "api_key = sk-abcdefghijklmnopqrstuvwxyz123"})
    (d / "broken.json").write_text("{not json", encoding="utf-8")
    write_json(d / "dup.json", {"category": "c", "source": "x", "items": [{"id": "1"}, {"id": "1"}]})
    errors = " ".join(validate_data_dir(d).errors)
    assert "category" in errors and "secret" in errors and "invalid JSON" in errors and "duplicate ids" in errors


def test_chunks_respect_limit_and_keep_header():
    text = "[Project] Big\nSubject: Prannavakhanth A.\n" + "\n".join(f"Line {i}: " + "word " * 30 for i in range(30))
    doc = Document("f::big", "Big", text, {"category": "projects", "doc_id": "f::big"})
    chunks = chunk_document(doc, max_chars=500)
    assert len(chunks) > 3
    assert all(len(c.text) <= 520 for c in chunks)
    assert all(c.text.startswith("[Project] Big\nSubject") for c in chunks)
    assert [c.metadata["chunk_index"] for c in chunks] == list(range(len(chunks)))
    assert all(c.metadata["chunk_total"] == len(chunks) for c in chunks)


def test_long_single_sentence_is_hard_wrapped():
    doc = Document("f::x", "X", "[A] X\nSubject: P\n" + "a" * 5000, {"doc_id": "f::x"})
    assert all(len(c.text) <= 520 for c in chunk_document(doc, 500))


# ---- ChromaDB collection, persistence, incremental update -------------------------------
def test_collection_uses_cosine_and_default_embedding(svc):
    service, _ = svc
    col = service.store.collection
    assert col.metadata.get("hnsw:space") == "cosine"
    ef = (col.configuration_json or {}).get("embedding_function") or {}
    assert ef.get("name") == "default"  # ChromaDB's built-in default - nothing configured by us


def test_ingest_search_and_metadata_mapping(svc):
    service, _ = svc
    stats = service.ingest()
    assert stats.added_chunks == stats.total_chunks == 3
    hits = service.store.search("Alpha vision system OpenCV", 3)
    assert hits[0].metadata["title"] == "Alpha"
    assert "Alpha is a vision system" in hits[0].text
    assert 0.0 < hits[0].score <= 1.0 and abs(hits[0].score - (1 - hits[0].distance)) < 1e-9
    assert all(h.vector_id in service.store.records for h in hits)


def test_list_metadata_round_trips(tmp_path):
    from app.rag.chunker import Chunk
    store = VectorStore(tmp_path / "c", "lists")
    try:
        md = {"doc_id": "d", "rel_path": "l.json", "title": "T", "aliases": ["a b", "c"], "skip": None}
        store.replace_file("l.json", [Chunk("d#0", "[X] T\nSubject: P\nbody", md)], "h")
        store.close()
        again = VectorStore(tmp_path / "c", "lists")
        assert again.records["d#0"]["metadata"]["aliases"] == ["a b", "c"]
        assert "skip" not in again.records["d#0"]["metadata"]
        again.close()
    finally:
        store.close()


def test_metadata_filtering(svc):
    service, _ = svc
    service.ingest()
    hits = service.store.search("anything", 5, where={"category": "skills"})
    assert hits and all(h.metadata["category"] == "skills" for h in hits)


def test_empty_collection_returns_no_results(tmp_path):
    store = VectorStore(tmp_path / "c", "empty_one")
    try:
        assert not store.ready and store.size == 0 and store.search("hello", 3) == []
        store.warmup()  # no-op on an empty store
    finally:
        store.close()


def test_persists_and_restart_does_not_reembed(svc, monkeypatch):
    service, s = svc
    service.ingest()
    service.store.close()
    store2 = VectorStore(s.chroma_path, s.chroma_collection_name)  # "application restart"
    assert store2.ready and store2.size == 3
    calls = []
    monkeypatch.setattr(type(store2.collection), "upsert", lambda *a, **k: calls.append(1))
    stats = IngestionService(s, store2).ingest()  # nothing changed -> nothing is embedded or upserted
    assert stats.added_chunks == 0 and stats.unchanged_files == 2 and not calls
    assert store2.search("Alpha vision system", 1)[0].metadata["title"] == "Alpha"
    store2.close()


def test_upsert_is_idempotent_no_duplicates(svc):
    service, _ = svc
    service.ingest()
    chunks = chunk_document(Document("d::1", "T", "[A] T\nSubject: P\nbody", {"doc_id": "d::1", "rel_path": "x.json"}), 900)
    for _ in range(3):
        service.store.replace_file("x.json", chunks, "h1")
    assert service.store.collection.count() == service.store.size == 4


def test_batch_upsert_larger_than_one_batch(tmp_path):
    from app.rag.chunker import Chunk
    store = VectorStore(tmp_path / "c", "batchy")
    try:
        chunks = [
            Chunk(f"d{i}#0", f"[X] Doc {i}\nSubject: P\nunique topic number {i}",
                  {"doc_id": f"d{i}", "rel_path": "b.json", "category": "x", "title": f"Doc {i}"})
            for i in range(150)
        ]
        assert store.replace_file("b.json", chunks, "h") == (150, 0)
        assert store.collection.count() == 150
    finally:
        store.close()


def test_incremental_update_reprocesses_only_changed_file(svc, small_data):
    service, _ = svc
    service.ingest()
    write_json(small_data / "projects" / "individual" / "alpha.json", {
        "category": "projects", "id": "alpha", "name": "Alpha", "source": "test",
        "description": "Alpha is now a speech system.", "technologies": ["Python"],
    })
    stats = service.ingest()
    assert (stats.added_chunks, stats.removed_chunks, stats.unchanged_files) == (1, 1, 1)
    assert service.store.size == service.store.collection.count() == 3  # no duplicates
    texts = " ".join(r["text"] for r in service.store.records.values())
    assert "speech system" in texts and "vision system" not in texts


def test_deleted_file_is_removed(svc, small_data):
    service, _ = svc
    service.ingest()
    (small_data / "projects" / "individual" / "alpha.json").unlink()
    stats = service.ingest()
    assert stats.removed_chunks == 1 and service.store.size == 2 == service.store.collection.count()
    assert all(r["metadata"]["title"] != "Alpha" for r in service.store.records.values())


def test_full_rebuild_resets_everything(svc, small_data):
    service, _ = svc
    service.ingest()
    (small_data / "skills" / "tools.json").unlink()
    stats = service.ingest(full_rebuild=True)
    assert stats.total_chunks == 1 and stats.added_chunks == 1


def test_invalid_data_blocks_ingestion(svc, small_data):
    service, _ = svc
    (small_data / "bad.json").write_text("{oops", encoding="utf-8")
    with pytest.raises(DataValidationError):
        service.ingest()


def test_embedding_failure_keeps_old_chunks(svc, small_data, monkeypatch):
    service, _ = svc
    service.ingest()
    write_json(small_data / "projects" / "individual" / "alpha.json", {
        "category": "projects", "id": "alpha", "name": "Alpha", "source": "test", "description": "Changed.",
    })

    def boom(*a, **k):
        raise RuntimeError("embedding model unavailable")

    monkeypatch.setattr(type(service.store.collection), "upsert", boom)
    with pytest.raises(VectorStoreError):
        service.ingest()
    assert service.store.size == 3 and "vision system" in " ".join(r["text"] for r in service.store.records.values())


def test_query_failure_is_wrapped(svc, monkeypatch):
    service, _ = svc
    service.ingest()
    monkeypatch.setattr(type(service.store.collection), "query", lambda *a, **k: (_ for _ in ()).throw(RuntimeError("x")))
    with pytest.raises(VectorStoreError):
        service.store.search("alpha", 2)


def test_invalid_database_path_is_reported(tmp_path):
    blocker = tmp_path / "file.txt"
    blocker.write_text("not a directory")
    with pytest.raises(VectorStoreError):
        VectorStore(blocker / "chroma", "x")


def test_retriever_uses_chroma_end_to_end(svc):
    service, _ = svc
    service.ingest()
    res = Retriever(service.store).retrieve("Alpha vision system")
    assert res.ranked and res.ranked[0].metadata["title"] == "Alpha" and res.best_similarity > 0.3


def test_concurrent_ingestion_is_serialised(svc):
    import threading
    service, _ = svc
    errs = []

    def run():
        try:
            service.ingest()
        except Exception as e:  # pragma: no cover
            errs.append(e)

    ts = [threading.Thread(target=run) for _ in range(3)]
    for t in ts:
        t.start()
    for t in ts:
        t.join()
    assert not errs and service.store.size == service.store.collection.count() == 3


def test_real_index_builds(real_container):
    assert real_container.store.ready
    cats = {d["category"] for d in real_container.store.documents()}
    assert {"projects", "skills", "education", "experience", "achievements", "research", "contact", "personal_profile"} <= cats
