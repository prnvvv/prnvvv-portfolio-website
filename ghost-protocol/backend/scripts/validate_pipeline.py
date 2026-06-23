#!/usr/bin/env python3
"""End-to-end validation script for the RAG pipeline."""

import os
import sys
import time
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR.parent.parent / ".env")
load_dotenv(BACKEND_DIR / ".env")

import chromadb
from rag import RAGPipeline

TEST_QUERIES = [
    "What projects have you built using Python?",
    "Tell me about your experience with machine learning.",
    "What is your educational background?",
    "Do you have any certifications?",
]


def get_chroma_collection():
    persist_dir = os.getenv("CHROMA_PERSIST_DIR", str(BACKEND_DIR / "chroma_db"))
    client = chromadb.PersistentClient(path=persist_dir)
    return client.get_collection("portfolio")


def run_pipeline():
    print("=" * 72)
    print("  RAG Pipeline - End-to-End Validation")
    print("=" * 72)

    print("\n[1/4] Connecting to ChromaDB ...")
    try:
        collection = get_chroma_collection()
        count = collection.count()
        print(f"       Connected. Collection 'portfolio' has {count} documents.")
    except Exception as exc:
        print(f"       FAILED to connect to ChromaDB: {exc}")
        sys.exit(1)

    print("\n[2/4] Initialising RAGPipeline ...")
    try:
        pipeline = RAGPipeline(
            chroma_collection=collection,
            use_llm=True,
            llm_model_name="llama-3.3-70b-versatile",
            use_reranker=True,
            use_query_expansion=True,
        )
        print("       RAGPipeline ready.")
    except Exception as exc:
        print(f"       FAILED to initialise pipeline: {exc}")
        sys.exit(1)

    print("\n[3/4] Running test queries ...")
    passed = 0
    for i, query in enumerate(TEST_QUERIES, start=1):
        print(f"\n  ----- Query {i}: {query} -----")
        try:
            result = pipeline.query(query_text=query)
        except Exception as exc:
            print(f"       QUERY FAILED: {exc}")
            sys.exit(1)

        response = result.get("response", "")
        confidence = result.get("confidence", 0.0)
        total_ms = result.get("total_time_ms", 0.0)
        sources = result.get("sources", [])

        print(f"  Response: {response[:400]}{'...' if len(response) > 400 else ''}")
        print(f"  Confidence: {confidence:.4f}  |  Time: {total_ms:.1f} ms")

        print("  Top sources:")
        for j, doc in enumerate(sources[:3], start=1):
            title = (
                doc.metadata.get("title")
                or doc.metadata.get("name")
                or f"Source {doc.id}"
            )
            print(f"    {j}. {title}  (score: {doc.score:.4f})")

        if confidence > 0 and response:
            passed += 1

    print("\n[4/4] Results ...")
    total = len(TEST_QUERIES)
    if passed == total:
        print(f"\n  All {total}/{total} tests passed - your chatbot backend is ready.\n")
    else:
        print(f"\n  {passed}/{total} queries returned valid responses. Check logs above.\n")


if __name__ == "__main__":
    run_pipeline()
