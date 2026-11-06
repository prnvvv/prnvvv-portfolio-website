"""Application container: heavyweight objects are created once at startup and shared."""
from __future__ import annotations

import logging
from dataclasses import dataclass

from fastapi import Request

from app.config import Settings
from app.core.exceptions import IndexNotReadyError
from app.core.logging import log_event
from app.core.security import SlidingWindowLimiter
from app.llm.groq_client import ChatLLM, GroqClient
from app.llm.response_generator import ResponseGenerator
from app.rag.embeddings import Embedder
from app.rag.pipeline import RAGPipeline
from app.rag.retriever import Retriever
from app.rag.vector_store import VectorStore
from app.services.chat_service import ChatService
from app.services.ingestion_service import IngestionService

logger = logging.getLogger(__name__)


@dataclass
class Container:
    settings: Settings
    embedder: Embedder
    store: VectorStore
    retriever: Retriever
    chat: ChatService
    ingestion: IngestionService
    ip_limiter: SlidingWindowLimiter
    session_limiter: SlidingWindowLimiter
    llm: ChatLLM | None = None


def build_container(settings: Settings, llm: ChatLLM | None = None, embedder: Embedder | None = None) -> Container:
    embedder = embedder or Embedder(settings.embedding_model)
    store = VectorStore(settings.index_path, settings.metadata_path, settings.embedding_model)
    ingestion = IngestionService(settings, embedder, store)

    if not store.load():
        # First start: build the index once. Later starts just load it from disk.
        log_event(logger, "no vector store found - running initial ingestion")
        ingestion.ingest()

    retriever = Retriever(store, embedder)
    llm = llm or GroqClient(
        api_key=settings.groq_api_key,
        model=settings.groq_model,
        temperature=settings.groq_temperature,
        max_tokens=settings.groq_max_tokens,
        timeout=settings.groq_timeout_seconds,
        max_retries=settings.groq_max_retries,
    )
    chat = ChatService(settings, RAGPipeline(retriever, settings), ResponseGenerator(llm, store.vocabulary))
    return Container(
        settings=settings, embedder=embedder, store=store, retriever=retriever, chat=chat, ingestion=ingestion,
        ip_limiter=SlidingWindowLimiter(settings.rate_limit_per_minute),
        session_limiter=SlidingWindowLimiter(settings.session_rate_limit_per_minute),
        llm=llm,
    )


def get_container(request: Request) -> Container:
    container = getattr(request.app.state, "container", None)
    if container is None or not container.store.ready:
        raise IndexNotReadyError()
    return container
