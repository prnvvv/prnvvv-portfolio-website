"""Retrieval orchestration: query -> candidates -> context guard -> prompt context."""
from __future__ import annotations

from dataclasses import dataclass, field

from app.config import Settings
from app.guardrails.context_guard import ContextDecision, evaluate_context
from app.guardrails.intent_classifier import Classification, Intent
from app.rag.reranker import Candidate
from app.rag.retriever import Retriever


@dataclass
class RAGContext:
    decision: ContextDecision
    best_similarity: float
    entities: list[str] = field(default_factory=list)

    @property
    def sufficient(self) -> bool:
        return self.decision.sufficient

    @property
    def chunks(self) -> list[Candidate]:
        return self.decision.chunks


class RAGPipeline:
    def __init__(self, retriever: Retriever, settings: Settings):
        self.retriever = retriever
        self.settings = settings

    def build_context(self, retrieval_query: str, classification: Classification,
                      entity_text: str | None = None) -> RAGContext:
        top_k = self.settings.top_k
        if classification.aggregate or len(classification.intents) > 1:
            top_k = min(top_k * 2, 12)  # comparisons / "list all" questions need broader evidence
        result = self.retriever.retrieve(retrieval_query, classification.categories, entity_text)
        decision = evaluate_context(
            result.ranked,
            threshold=self.settings.similarity_threshold,
            top_k=top_k,
            max_context_chars=self.settings.max_context_length,
            relax_topic=Intent.PORTFOLIO_GENERAL not in classification.intents,
        )
        return RAGContext(decision, result.best_similarity, result.entities)
