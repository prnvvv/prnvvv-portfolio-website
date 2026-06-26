import logging
import time
import uuid

import chromadb
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from rag.pipeline.orchestrator import RAGPipeline

logger = logging.getLogger(__name__)

router = APIRouter()

pipeline = None


def get_pipeline():
    global pipeline
    if pipeline is None:
        logger.info("Initialising RAG pipeline ...")
        chroma_client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir,
        )
        collection = chroma_client.get_or_create_collection(
            name=settings.chroma_collection_name,
        )
        pipeline = RAGPipeline(
            chroma_collection=collection,
            embedding_model=settings.embedding_model,
            top_k=settings.top_k,
            use_llm=settings.use_llm,
            llm_model_name=settings.llm_model_name,
            llm_api_key=settings.groq_api_key,
        )
        logger.info("RAG pipeline ready.")
    return pipeline


class ChatRequest(BaseModel):
    query: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    sources: list[dict] = []
    confidence: float = 0.0
    retrieval_method: str = "none"
    total_time_ms: float = 0.0
    citations: list[str] = []
    session_id: str = ""


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    q = request.query.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    if len(q) > 1000:
        raise HTTPException(status_code=400, detail="Query too long (max 1000 chars)")

    session_id = request.session_id or uuid.uuid4().hex[:12]

    try:
        pipe = get_pipeline()
    except Exception as exc:
        logger.error("Failed to initialise pipeline: %s", exc)
        raise HTTPException(status_code=500, detail="AI core not available")

    try:
        result = pipe.query(q)
    except Exception as exc:
        logger.error("Pipeline query failed: %s", exc)
        raise HTTPException(status_code=500, detail="Query processing failed")

    sources = []
    for doc in result.get("sources", []):
        if isinstance(doc, dict):
            sources.append({
                "id": doc.get("id", ""),
                "text": doc.get("text", "")[:200],
                "metadata": doc.get("metadata", {}),
                "score": doc.get("score"),
            })

    return ChatResponse(
        response=result.get("response", ""),
        sources=sources,
        confidence=result.get("confidence", 0.0),
        retrieval_method=result.get("retrieval_method", "none"),
        total_time_ms=result.get("total_time_ms", 0.0),
        citations=result.get("citations", []),
        session_id=session_id,
    )
