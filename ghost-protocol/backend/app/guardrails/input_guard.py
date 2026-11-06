"""Input validation and conversation-level abuse tracking."""
from __future__ import annotations

import re
import time
import unicodedata
from dataclasses import dataclass
from threading import Lock

_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_BIDI = dict.fromkeys(map(ord, "‪‫‬‭‮⁦⁧⁨⁩"), None)
_REPEAT_CHAR = re.compile(r"(.)\1{40,}")
_REPEAT_TOKEN = re.compile(r"\b(\w{1,20})\b(?:\W+\1\b){15,}", re.I)


@dataclass
class InputCheck:
    ok: bool
    cleaned: str = ""
    reason: str | None = None


def check_input(message: str, max_length: int) -> InputCheck:
    if not isinstance(message, str):
        return InputCheck(False, reason="malformed")
    if len(message) > max_length * 2:  # reject before doing any regex work on huge input
        return InputCheck(False, reason="too_long")
    if message.count("\n") > 20:
        return InputCheck(False, reason="malformed")
    text = unicodedata.normalize("NFC", message).translate(_BIDI)
    text = _CONTROL.sub(" ", text).strip()
    if not text:
        return InputCheck(False, reason="empty")
    if len(text) > max_length:
        return InputCheck(False, reason="too_long")
    if text.count("\n") > 20:
        return InputCheck(False, reason="malformed")
    if _REPEAT_CHAR.search(text) or _REPEAT_TOKEN.search(text):
        return InputCheck(False, reason="malformed")
    letters = sum(c.isalpha() for c in text)
    if len(text) > 20 and letters / len(text) < 0.3:
        return InputCheck(False, reason="malformed")
    return InputCheck(True, cleaned=text)


class AdversarialTracker:
    """Counts adversarial messages per session. After `limit` strikes inside the window the
    session is locked out for `lockout` seconds (every message gets the standard refusal)."""

    def __init__(self, limit: int = 3, window: int = 600, lockout: int = 300, max_sessions: int = 5000):
        self.limit, self.window, self.lockout, self.max_sessions = limit, window, lockout, max_sessions
        self._strikes: dict[str, list[float]] = {}
        self._locked_until: dict[str, float] = {}
        self._lock = Lock()

    def is_locked(self, session_id: str) -> bool:
        with self._lock:
            until = self._locked_until.get(session_id)
            if until is None:
                return False
            if time.monotonic() >= until:
                self._locked_until.pop(session_id, None)
                self._strikes.pop(session_id, None)
                return False
            return True

    def record(self, session_id: str) -> bool:
        """Register a strike. Returns True when the session just became locked."""
        now = time.monotonic()
        with self._lock:
            if len(self._strikes) > self.max_sessions:
                self._strikes.clear()
            hits = [t for t in self._strikes.get(session_id, []) if now - t < self.window]
            hits.append(now)
            self._strikes[session_id] = hits
            if len(hits) >= self.limit:
                self._locked_until[session_id] = now + self.lockout
                return True
            return False
