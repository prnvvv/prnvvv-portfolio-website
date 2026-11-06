from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    """Only the new message and a session id are accepted. Conversation history is kept
    server-side; the client can never supply (and so never forge) prior turns."""

    model_config = ConfigDict(extra="forbid")

    message: str = Field(..., min_length=1, max_length=4000)
    session_id: str | None = Field(default=None, pattern=r"^[A-Za-z0-9_\-]{8,64}$")
