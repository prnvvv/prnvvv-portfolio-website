from __future__ import annotations

from fastapi import APIRouter, Request

from app.schemas.response import HealthResponse

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    """Liveness + RAG readiness. Reveals no configuration values."""
    c = getattr(request.app.state, "container", None)
    if c is None:
        return HealthResponse(status="starting", index_loaded=False, documents=0, llm_configured=False)
    ready = c.store.ready
    return HealthResponse(
        status="ok" if ready else "degraded",
        index_loaded=ready,
        documents=len(c.store.documents()) if ready else 0,
        llm_configured=c.llm is not None,
    )
