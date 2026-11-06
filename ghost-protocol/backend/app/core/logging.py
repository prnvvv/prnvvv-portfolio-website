"""Structured JSON logging. Visitor message text is never logged - only length and a short hash."""
from __future__ import annotations

import hashlib
import json
import logging
import re
import sys
from datetime import datetime, timezone

_SECRET_RE = re.compile(r"(gsk_[A-Za-z0-9]{10,}|sk-[A-Za-z0-9]{16,}|(?i:bearer)\s+[A-Za-z0-9._\-]{16,})")


def redact(text: str) -> str:
    return _SECRET_RE.sub("[REDACTED]", text)


def fingerprint(text: str) -> str:
    """Short, non-reversible identifier for correlating log lines without storing content."""
    return hashlib.sha256(text.encode("utf-8", "ignore")).hexdigest()[:10]


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
            "level": record.levelname,
            "logger": record.name,
            "msg": redact(record.getMessage()),
        }
        extra = getattr(record, "fields", None)
        if isinstance(extra, dict):
            payload.update({k: v for k, v in extra.items() if k not in payload})
        if record.exc_info and record.levelno >= logging.ERROR:
            payload["exc_type"] = record.exc_info[0].__name__ if record.exc_info[0] else None
        return json.dumps(payload, ensure_ascii=False, default=str)


def configure_logging(debug: bool = False) -> None:
    root = logging.getLogger()
    for h in [h for h in root.handlers if getattr(h, "_portfolio", False)]:
        root.removeHandler(h)
    handler = logging.StreamHandler(sys.stdout)
    handler._portfolio = True  # type: ignore[attr-defined]
    handler.setFormatter(JsonFormatter())
    root.addHandler(handler)
    root.setLevel(logging.DEBUG if debug else logging.INFO)
    for noisy in ("httpx", "httpx2", "httpcore", "httpcore2", "urllib3", "chromadb", "onnxruntime"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def log_event(logger: logging.Logger, msg: str, level: int = logging.INFO, **fields) -> None:
    logger.log(level, msg, extra={"fields": fields})
