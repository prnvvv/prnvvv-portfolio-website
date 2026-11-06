"""Rate limiting, admin auth, request-size enforcement and security headers."""
from __future__ import annotations

import hmac
import re
import time
from collections import defaultdict, deque
from threading import Lock

from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.exceptions import RateLimitedError, RequestTooLargeError

SESSION_ID_RE = re.compile(r"^[A-Za-z0-9_\-]{8,64}$")


class SlidingWindowLimiter:
    """In-memory sliding-window limiter. Sufficient for a single-process deployment;
    use a shared store (e.g. Redis) if you scale horizontally."""

    def __init__(self, limit: int, window_seconds: int = 60, max_keys: int = 10_000):
        self.limit = limit
        self.window = window_seconds
        self.max_keys = max_keys
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def check(self, key: str) -> None:
        now = time.monotonic()
        with self._lock:
            if len(self._hits) > self.max_keys:
                self._evict(now)
            q = self._hits[key]
            while q and now - q[0] > self.window:
                q.popleft()
            if len(q) >= self.limit:
                retry = int(self.window - (now - q[0])) + 1
                raise RateLimitedError(retry_after=max(retry, 1))
            q.append(now)

    def _evict(self, now: float) -> None:
        stale = [k for k, q in self._hits.items() if not q or now - q[-1] > self.window]
        for k in stale:
            self._hits.pop(k, None)


def verify_admin_token(provided: str | None, expected: str) -> bool:
    if not provided or not expected:
        return False
    return hmac.compare_digest(provided.encode(), expected.encode())


class BodySizeLimitMiddleware:
    """Rejects request bodies larger than `max_bytes`, including chunked uploads without Content-Length."""

    def __init__(self, app: ASGIApp, max_bytes: int):
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers") or [])
        declared = headers.get(b"content-length")
        if declared and declared.isdigit() and int(declared) > self.max_bytes:
            await self._reject(send)
            return

        received = 0

        async def limited_receive() -> Message:
            nonlocal received
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_bytes:
                    raise RequestTooLargeError()
            return message

        try:
            await self.app(scope, limited_receive, send)
        except RequestTooLargeError:
            await self._reject(send)

    @staticmethod
    async def _reject(send: Send) -> None:
        body = b'{"success":false,"error":"Request is too large."}'
        await send({"type": "http.response.start", "status": 413,
                    "headers": [(b"content-type", b"application/json"),
                                (b"content-length", str(len(body)).encode())]})
        await send({"type": "http.response.body", "body": body})


class SecurityHeadersMiddleware:
    HEADERS = [
        (b"x-content-type-options", b"nosniff"),
        (b"x-frame-options", b"DENY"),
        (b"referrer-policy", b"no-referrer"),
        (b"cache-control", b"no-store"),
        (b"content-security-policy", b"default-src 'none'; frame-ancestors 'none'"),
    ]

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message: Message) -> None:
            if message["type"] == "http.response.start":
                existing = {k.lower() for k, _ in message.get("headers", [])}
                message["headers"] = list(message.get("headers", [])) + [
                    h for h in self.HEADERS if h[0] not in existing
                ]
            await send(message)

        await self.app(scope, receive, send_wrapper)
