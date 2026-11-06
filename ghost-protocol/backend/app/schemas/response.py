from __future__ import annotations

from pydantic import BaseModel, Field


class Source(BaseModel):
    category: str
    document: str
    title: str


class ChatResponse(BaseModel):
    success: bool = True
    answer: str
    sources: list[Source] = Field(default_factory=list)
    session_id: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: str


class HealthResponse(BaseModel):
    status: str
    index_loaded: bool
    documents: int
    llm_configured: bool


class IngestResponse(BaseModel):
    success: bool = True
    added_chunks: int
    removed_chunks: int
    unchanged_files: int
    total_chunks: int
