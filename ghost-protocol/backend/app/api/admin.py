"""Admin ingestion endpoint.

Disabled (404) unless ADMIN_TOKEN (>= 24 chars) is configured. Prefer the CLI scripts instead:
`python scripts/ingest.py` / `python scripts/rebuild_index.py`.
"""
from __future__ import annotations

import asyncio

from fastapi import APIRouter, Header, Request

from app.api.chat import client_ip
from app.core.exceptions import NotFoundError, UnauthorizedError
from app.core.security import SlidingWindowLimiter, verify_admin_token
from app.schemas.response import IngestResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])
_admin_limiter = SlidingWindowLimiter(limit=5, window_seconds=60)


@router.post("/ingest", response_model=IngestResponse)
async def ingest(request: Request, full_rebuild: bool = False,
                 x_admin_token: str | None = Header(default=None)) -> IngestResponse:
    c = getattr(request.app.state, "container", None)
    if c is None or not c.settings.admin_enabled:
        raise NotFoundError()  # indistinguishable from a non-existent route
    _admin_limiter.check(client_ip(request, c.settings.trust_proxy_headers))
    if not verify_admin_token(x_admin_token, c.settings.admin_token):
        raise UnauthorizedError()
    stats = await asyncio.to_thread(c.ingestion.ingest, full_rebuild)
    c.retriever.refresh()
    return IngestResponse(added_chunks=stats.added_chunks, removed_chunks=stats.removed_chunks,
                          unchanged_files=stats.unchanged_files, total_chunks=stats.total_chunks)
