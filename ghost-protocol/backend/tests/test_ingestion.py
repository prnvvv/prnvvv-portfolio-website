"""JSON ingestion, chunking, embeddings, FAISS persistence, incremental updates, rebuilds."""
from __future__ import annotations

import json
import shutil

import numpy as np
import pytest

from app.core.exceptions import DataValidationError
from app.rag.chunker import chunk_document
from app.rag.data_validator import validate_data_dir
from app.rag.document_loader import Document, list_json_files, load_file
from app.rag.vector_store import IndexCorruptError, VectorStore
from app.services.ingestion_service import IngestionService
from tests.conftest import EMBEDDING_MODEL, REAL_DATA, make_settings


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
def svc(tmp_path, small_data, embedder):
    s = make_settings(tmp_path / "idx", small_data)
    store = VectorStore(s.index_path, s.metadata_path, EMBEDDING_MODEL)
    return IngestionService(s, embedder, store), s


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


# ---- embeddings ---------------------------------------------------------------------
def test_embeddings_are_normalised_and_semantic(embedder):
    v = embedder.encode(["python programming language", "snake python reptile", "weather forecast tomorrow"])
    assert v.shape == (3, embedder.dimension) and v.dtype == np.float32
    assert np.allclose(np.linalg.norm(v, axis=1), 1.0, atol=1e-4)
    q = embedder.encode_query("python programming")
    assert float(q @ v[0]) > float(q @ v[2])


# ---- FAISS index, persistence, incremental update ------------------------------------
def test_ingest_search_and_metadata_mapping(svc, embedder):
    service, s = svc
    stats = service.ingest()
    assert stats.added_chunks == stats.total_chunks == 3
    hits = service.store.search(embedder.encode_query("Alpha vision system OpenCV"), 3)
    assert hits[0].metadata["title"] == "Alpha"
    assert "Alpha is a vision system" in hits[0].text
    assert all(h.vector_id in service.store.records for h in hits)  # vector id -> record mapping


def test_index_persists_and_reloads_without_reembedding(svc, embedder, monkeypatch):
    service, s = svc
    service.ingest()
    store2 = VectorStore(s.index_path, s.metadata_path, EMBEDDING_MODEL)
    assert store2.load() and store2.size == 3
    monkeypatch.setattr(type(embedder), "encode", lambda *a, **k: (_ for _ in ()).throw(AssertionError("re-embedded")))
    stats = IngestionService(s, embedder, store2).ingest()  # nothing changed -> must not embed anything
    assert stats.added_chunks == 0 and stats.unchanged_files == 2


def test_incremental_update_reprocesses_only_changed_file(svc, small_data, embedder):
    service, _ = svc
    service.ingest()
    write_json(small_data / "projects" / "individual" / "alpha.json", {
        "category": "projects", "id": "alpha", "name": "Alpha", "source": "test",
        "description": "Alpha is now a speech system.", "technologies": ["Python"],
    })
    stats = service.ingest()
    assert (stats.added_chunks, stats.removed_chunks, stats.unchanged_files) == (1, 1, 1)
    assert service.store.size == 3  # no duplicates
    texts = " ".join(r["text"] for r in service.store.records.values())
    assert "speech system" in texts and "vision system" not in texts


def test_deleted_file_is_removed(svc, small_data):
    service, _ = svc
    service.ingest()
    (small_data / "projects" / "individual" / "alpha.json").unlink()
    stats = service.ingest()
    assert stats.removed_chunks == 1 and service.store.size == 2
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


def test_corrupt_or_mismatched_index_is_detected(svc):
    service, s = svc
    service.ingest()
    s.metadata_path.write_text("{}", encoding="utf-8")
    with pytest.raises(IndexCorruptError):
        VectorStore(s.index_path, s.metadata_path, EMBEDDING_MODEL).load()
    service.ingest(full_rebuild=True)
    with pytest.raises(IndexCorruptError):
        VectorStore(s.index_path, s.metadata_path, "other-model").load()


def test_real_index_builds(real_container):
    assert real_container.store.ready
    cats = {d["category"] for d in real_container.store.documents()}
    assert {"projects", "skills", "education", "experience", "achievements", "research", "contact", "personal_profile"} <= cats
