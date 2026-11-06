"""Lightweight, dependency-free reranker.

Blends the dense similarity with lexical overlap and two structural signals (an explicit
entity/project mention in the query and agreement with the classified intent categories).
A cross-encoder could be dropped in behind the same ``rerank`` signature.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

STOPWORDS = frozenset(
    "a an the of in on at to for and or is are was were be been do does did what which who whom how "
    "when where why can could would should tell me about his him he her she they them it its this that "
    "these those with from by as has have had any all give show explain describe list his prannavakhanth "
    "prannavakhanth's portfolio please also more some many much".split()
)
TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9+#.\-/]*")


def tokens(text: str) -> set[str]:
    return {t.strip(".-/") for t in TOKEN_RE.findall(text.lower()) if t not in STOPWORDS and len(t) > 1}


@dataclass
class Candidate:
    text: str
    sim: float
    metadata: dict[str, Any]
    vector_id: str = ""
    score: float = 0.0
    title_overlap: float = 0.0
    text_overlap: float = 0.0
    entity_match: bool = False
    category_match: bool = False
    reasons: list[str] = field(default_factory=list)


def rerank(
    query: str,
    candidates: list[Candidate],
    intent_categories: set[str] | None = None,
    entity_doc_ids: set[str] | None = None,
) -> list[Candidate]:
    q = tokens(query)
    for c in candidates:
        title_tokens = tokens(c.metadata.get("title", "") + " " + " ".join(c.metadata.get("aliases", [])))
        body_tokens = tokens(c.text)
        c.title_overlap = len(q & title_tokens) / len(q) if q else 0.0
        c.text_overlap = len(q & body_tokens) / len(q) if q else 0.0
        c.entity_match = bool(entity_doc_ids and c.metadata.get("doc_id") in entity_doc_ids)
        score = c.sim + 0.20 * c.title_overlap + 0.10 * c.text_overlap
        c.category_match = bool(intent_categories and c.metadata.get("category") in intent_categories)
        if c.category_match:
            score += 0.15
        if c.entity_match:
            score += 0.25
        if c.metadata.get("category") == "faq":
            score -= 0.05  # FAQ entries summarise other files; prefer the primary source
        c.score = score
    return sorted(candidates, key=lambda c: c.score, reverse=True)
