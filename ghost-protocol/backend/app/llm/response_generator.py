"""Generates a grounded answer: LLM call -> output guard -> one strict regeneration -> safe fallback."""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Callable

from app.core.logging import log_event
from app.guardrails.output_guard import validate_output
from app.guardrails.system_policy import FALLBACK_MISSING, NOT_IN_PORTFOLIO_TOKEN
from app.llm.groq_client import ChatLLM
from app.llm.prompt_templates import build_messages

logger = logging.getLogger(__name__)


@dataclass
class Generated:
    answer: str
    grounded: bool  # False when we returned a fallback instead of a model answer
    attempts: int


class ResponseGenerator:
    def __init__(self, llm: ChatLLM, vocabulary: Callable[[], frozenset[str]] | None = None):
        self.llm = llm
        self.vocabulary = vocabulary

    async def generate(self, question: str, context: str, history: list[tuple[str, str]]) -> Generated:
        for attempt in (1, 2):
            raw = await self.llm.complete(build_messages(question, context, history, strict=attempt == 2))
            if raw.strip().strip(".").upper() == NOT_IN_PORTFOLIO_TOKEN or raw.strip().startswith(NOT_IN_PORTFOLIO_TOKEN):
                return Generated(FALLBACK_MISSING, False, attempt)
            check = validate_output(raw, context=context, question=question,
                                    vocabulary=self.vocabulary() if self.vocabulary else None)
            if check.ok:
                return Generated(raw.strip(), True, attempt)
            log_event(logger, "output guard rejected answer", level=logging.WARNING,
                      reason=check.reason, attempt=attempt)
        return Generated(FALLBACK_MISSING, False, 2)
