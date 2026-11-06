"""Retrieval-quality check used to calibrate SIMILARITY_THRESHOLD.

Runs labelled in-scope questions (with the document each should surface) and unrelated
questions through the retriever and reports the similarity separation.

Usage: python scripts/eval_retrieval.py
"""
import _bootstrap  # noqa: F401
import sys

from app.config import get_settings
from app.guardrails.intent_classifier import classify_intent
from app.rag.embeddings import Embedder
from app.rag.retriever import Retriever
from app.rag.vector_store import VectorStore

# (question, substring expected in the category / file / title of one of the top-5 chunks)
IN_SCOPE = [
    ("Who is Prannavakhanth?", "personal_profile"),
    ("What are his technical skills?", "skills"),
    ("What projects has he developed?", "projects"),
    ("Explain his FitAI project.", "fitai"),
    ("What is his educational background?", "education"),
    ("What programming languages does he know?", "programming_languages"),
    ("Does he have experience with machine learning?", "skills"),
    ("What leadership positions has he held?", "leadership"),
    ("What research work has he done?", "research"),
    ("How can I contact him?", "contact"),
    ("Which project demonstrates his experience with RAG?", "polaris"),
    ("What technologies did he use in CropCore?", "cropcore"),
    ("Tell me about his patents.", "patents"),
    ("Where does he work?", "professional_experience"),
    ("What hackathons has he won?", "hackathons"),
    ("What certifications does he have?", "certifications"),
    ("Tell me about SSL-RUL.", "sslrul"),
    ("What did he do at Hexaware?", "internships"),
    ("Does he know PyTorch?", "frameworks"),
    ("What is his CGPA?", "academic_details"),
]
OUT_OF_SCOPE = [
    "What is the capital of France?",
    "Explain quantum computing.",
    "Who is Elon Musk?",
    "What is the weather today?",
    "What is machine learning?",
    "How do I bake a chocolate cake?",
    "Who won the football world cup?",
    "Write a Python program to sort a list.",
]


def main() -> int:
    s = get_settings()
    store = VectorStore(s.index_path, s.metadata_path, s.embedding_model)
    if not store.load():
        print("No index. Run scripts/ingest.py first.")
        return 1
    r = Retriever(store, Embedder(s.embedding_model, s.hf_token))
    hit = 0
    in_best = []
    print(f"threshold={s.similarity_threshold}\n--- in-scope ---")
    for q, expect in IN_SCOPE:
        cls = classify_intent(q, r.entity_names(q))
        res = r.retrieve(q, cls.categories)
        top = res.ranked[:5]
        found = any(expect in (c.metadata["category"] + c.metadata["source_file"] + c.metadata["title"]).lower() for c in top)
        hit += found
        in_best.append(res.best_similarity)
        print(f"{'OK ' if found else 'MISS'} sim={res.best_similarity:.2f} {cls.primary.value:<17} {q}  -> {top[0].metadata['source_file']}")
    print("\n--- unrelated (raw retrieval, ignoring the classifier) ---")
    out_best = []
    for q in OUT_OF_SCOPE:
        res = r.retrieve(q)
        out_best.append(res.best_similarity)
        print(f"sim={res.best_similarity:.2f} {q}")
    print(f"\nrecall@5: {hit}/{len(IN_SCOPE)}")
    print(f"in-scope best-sim   min={min(in_best):.2f} mean={sum(in_best)/len(in_best):.2f}")
    print(f"unrelated best-sim  max={max(out_best):.2f} mean={sum(out_best)/len(out_best):.2f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
