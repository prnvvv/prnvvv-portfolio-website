"""FastAPI application factory."""
from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import admin, chat, health
from app.config import Settings, get_settings
from app.core.exceptions import AppError, RateLimitedError
from app.core.logging import configure_logging, log_event
from app.core.security import BodySizeLimitMiddleware, SecurityHeadersMiddleware
from app.dependencies import Container, build_container

logger = logging.getLogger(__name__)


def create_app(settings: Settings | None = None, container: Container | None = None) -> FastAPI:
    """`container` lets tests inject a pre-built container (fake LLM / small corpus)."""
    settings = settings or get_settings()
    configure_logging(settings.debug)

    async def _init_in_background(app: FastAPI) -> None:
        """Model download + first ingestion can take minutes on a small host; doing it after the port is
        open lets the host's health check pass. /api/health reports "starting" (or "failed") and
        /api/chat answers "not ready" until it finishes. Retries a few times for transient download errors."""
        for attempt in range(1, 4):
            try:
                c = await asyncio.to_thread(build_container, settings)
                await asyncio.to_thread(c.store.warmup)
                app.state.container = c
                app.state.init_error = None
                log_event(logger, "backend ready", documents=len(c.store.documents()))
                return
            except Exception as e:
                app.state.init_error = type(e).__name__
                logger.error("backend initialisation failed (attempt %d/3): %s: %s", attempt, type(e).__name__, str(e)[:300])
                logger.debug("initialisation traceback", exc_info=True)
                await asyncio.sleep(15)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        init_task = None
        if container is not None:
            app.state.container = container
            log_event(logger, "backend ready", documents=len(container.store.documents()))
        else:
            settings.validate_runtime()  # fail fast with a clear message
            app.state.container = None
            app.state.init_error = None
            init_task = asyncio.create_task(_init_in_background(app))
        yield
        if init_task is not None and not init_task.done():
            init_task.cancel()
        c = getattr(app.state, "container", None)
        if c is not None:
            getattr(c.store, "close", lambda: None)()
            llm = getattr(c, "llm", None)
            if llm is not None and hasattr(llm, "aclose"):
                await llm.aclose()

    app = FastAPI(
        title="Portfolio RAG Assistant",
        lifespan=lifespan,
        docs_url="/docs" if settings.debug else None,
        redoc_url=None,
        openapi_url="/openapi.json" if settings.debug else None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:\d{1,5})?$" if settings.allow_localhost_origins else None,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "X-Admin-Token"],
        max_age=600,
    )
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(BodySizeLimitMiddleware, max_bytes=settings.max_request_bytes)

    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError):
        headers = {"Retry-After": str(exc.retry_after)} if isinstance(exc, RateLimitedError) else None
        if exc.detail and exc.detail != exc.public_message:
            log_event(logger, "app error", level=logging.WARNING, error=type(exc).__name__)
        return JSONResponse({"success": False, "error": exc.public_message}, status_code=exc.status_code, headers=headers)

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_: Request, __: RequestValidationError):
        # never echo the submitted payload back
        return JSONResponse({"success": False, "error": "Invalid request."}, status_code=422)

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception):
        log_event(logger, "unhandled error", level=logging.ERROR, error=type(exc).__name__)
        return JSONResponse({"success": False, "error": AppError.public_message}, status_code=500)

    app.include_router(health.router)
    app.include_router(chat.router)
    app.include_router(admin.router)
    return app


def _default_app() -> FastAPI:
    return create_app()


app = _default_app() if __name__ != "__main__" else None  # `uvicorn app.main:app`
