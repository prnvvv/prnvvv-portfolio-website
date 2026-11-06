"""Chat orchestration: guardrails -> classification -> retrieval -> generation -> output validation."""
from __future__ import annotations

import asyncio
import logging
import secrets
import time
from collections import OrderedDict
from dataclasses import dataclass, field
from threading import Lock

from app.config import Settings
from app.core.logging import fingerprint, log_event
from app.guardrails.input_guard import AdversarialTracker, check_input
from app.guardrails.intent_classifier import FOLLOW_UP, OVERVIEW_QUERY, Intent, classify_intent
from app.guardrails.system_policy import (
    FALLBACK_AMBIGUOUS,
    FALLBACK_INJECTION,
    FALLBACK_INVALID_INPUT,
    FALLBACK_LOCKED,
    FALLBACK_MISSING,
    FALLBACK_OUT_OF_SCOPE,
    SMALLTALK,
)
from app.llm.response_generator import ResponseGenerator
from app.rag.pipeline import RAGPipeline
from app.schemas.response import Source

logger = logging.getLogger(__name__)


@dataclass
class ChatResult:
    answer: str
    session_id: str
    sources: list[Source] = field(default_factory=list)
    outcome: str = "answered"


class SessionStore:
    """Server-side, per-session history. Sessions are isolated by id, bounded in size and TTL.
    Only validated turns are stored, so blocked/adversarial text can never poison later prompts."""

    def __init__(self, ttl_seconds: int, max_sessions: int, max_turns: int):
        self.ttl, self.max_sessions, self.max_turns = ttl_seconds, max_sessions, max_turns
        self._data: OrderedDict[str, tuple[float, list[tuple[str, str]]]] = OrderedDict()
        self._lock = Lock()

    def _purge(self, now: float) -> None:
        for sid in [s for s, (t, _) in self._data.items() if now - t > self.ttl]:
            self._data.pop(sid, None)
        while len(self._data) > self.max_sessions:
            self._data.popitem(last=False)

    def history(self, sid: str) -> list[tuple[str, str]]:
        now = time.monotonic()
        with self._lock:
            self._purge(now)
            entry = self._data.get(sid)
            return list(entry[1][-self.max_turns:]) if entry and self.max_turns else []

    def add(self, sid: str, question: str, answer: str) -> None:
        if not self.max_turns:
            return
        now = time.monotonic()
        with self._lock:
            _, turns = self._data.get(sid, (now, []))
            turns.append((question, answer))
            self._data[sid] = (now, turns[-self.max_turns:])
            self._data.move_to_end(sid)
            self._purge(now)


class ChatService:
    def __init__(self, settings: Settings, rag: RAGPipeline, generator: ResponseGenerator):
        self.settings = settings
        self.rag = rag
        self.generator = generator
        self.sessions = SessionStore(settings.session_ttl_seconds, settings.max_sessions, settings.max_history_turns)
        self.tracker = AdversarialTracker(
            limit=settings.adversarial_strike_limit,
            lockout=settings.adversarial_lockout_seconds,
        )

    async def answer(self, message: str, session_id: str | None) -> ChatResult:
        started = time.monotonic()
        sid = session_id or secrets.token_urlsafe(16)
        result = await self._answer(message, sid)
        log_event(logger, "chat", outcome=result.outcome, msg_len=len(message), msg_id=fingerprint(message),
                  session=fingerprint(sid), ms=int((time.monotonic() - started) * 1000))
        return result

    async def _answer(self, message: str, sid: str) -> ChatResult:
        if self.tracker.is_locked(sid):
            return ChatResult(FALLBACK_LOCKED, sid, outcome="locked")

        check = check_input(message, self.settings.max_input_length)
        if not check.ok:
            return ChatResult(FALLBACK_INVALID_INPUT, sid, outcome=f"invalid:{check.reason}")
        text = check.cleaned

        history = self.sessions.history(sid)
        entities = self.rag.retriever.entity_names(text)
        cls = classify_intent(text, entities, has_history=bool(history))

        if cls.adversarial:
            locked = self.tracker.record(sid)
            return ChatResult(FALLBACK_INJECTION, sid, outcome=f"blocked:{cls.primary.value}" + (":locked" if locked else ""))
        if cls.primary == Intent.OUT_OF_SCOPE:
            return ChatResult(FALLBACK_OUT_OF_SCOPE, sid, outcome="out_of_scope")
        if cls.primary == Intent.AMBIGUOUS:
            return ChatResult(FALLBACK_AMBIGUOUS, sid, outcome="ambiguous")
        if cls.smalltalk:
            return ChatResult(SMALLTALK[cls.smalltalk], sid, outcome=f"smalltalk:{cls.smalltalk}")

        # Short follow-ups ("what technologies did he use in it?") borrow the previous *accepted* question
        # for retrieval only; it is never promoted to an instruction.
        retrieval_query, entity_text = text, text
        if cls.overview:
            retrieval_query = f"{cls.hint or OVERVIEW_QUERY} {text}"
        elif history and len(text.split()) <= 14 and FOLLOW_UP.search(text):
            retrieval_query = f"{history[-1][0]} {text}"
            entity_text = retrieval_query
            cls = classify_intent(retrieval_query, self.rag.retriever.entity_names(entity_text), has_history=True)
            if not cls.allowed:  # combined text is still ours (previous turn was already accepted)
                cls = classify_intent(text, entities, has_history=True)

        ctx = await asyncio.to_thread(self.rag.build_context, retrieval_query, cls, entity_text)
        if not ctx.sufficient:
            return ChatResult(FALLBACK_MISSING, sid, outcome=f"no_context:{ctx.decision.reason}")

        gen = await self.generator.generate(text, ctx.decision.context_text, history)
        if not gen.grounded:
            return ChatResult(gen.answer, sid, outcome="no_grounded_answer")

        self.sessions.add(sid, text, gen.answer)
        return ChatResult(gen.answer, sid, self._sources(ctx.chunks), outcome="answered")

    @staticmethod
    def _sources(chunks) -> list[Source]:
        seen: set[tuple[str, str]] = set()
        out: list[Source] = []
        for c in chunks:
            md = c.metadata
            key = (md["rel_path"], md["title"])
            if key in seen:
                continue
            seen.add(key)
            out.append(Source(category=md["category"], document=md["source_file"], title=md["title"]))
            if len(out) >= 4:
                break
        return out
