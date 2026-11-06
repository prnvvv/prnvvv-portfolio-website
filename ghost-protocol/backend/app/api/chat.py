from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends, Request

from app.core.exceptions import LLMTimeoutError
from app.dependencies import Container, get_container
from app.schemas.request import ChatRequest
from app.schemas.response import ChatResponse

router = APIRouter(prefix="/api", tags=["chat"])


def client_ip(request: Request, trust_proxy: bool) -> str:
    if trust_proxy:
        fwd = request.headers.get("x-forwarded-for")
        if fwd:
            return fwd.split(",")[0].strip()[:64]
    return request.client.host if request.client else "unknown"


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, request: Request, c: Container = Depends(get_container)) -> ChatResponse:
    c.ip_limiter.check(client_ip(request, c.settings.trust_proxy_headers))
    if body.session_id:
        c.session_limiter.check(body.session_id)
    try:
        result = await asyncio.wait_for(
            c.chat.answer(body.message, body.session_id), timeout=c.settings.request_timeout_seconds
        )
    except asyncio.TimeoutError as e:
        raise LLMTimeoutError() from e
    return ChatResponse(success=True, answer=result.answer, sources=result.sources, session_id=result.session_id)
