"""
Pydantic models for the RAG pipeline.
All data flowing through the pipeline is typed via these schemas.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class Document(BaseModel):
    """Represents a retrieved document chunk."""

    id: str
    text: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    distance: Optional[float] = None  # Lower = more similar (L2/cosine distance)
    score: Optional[float] = None     # Higher = more relevant (normalized relevance)

    def __repr__(self) -> str:
        return f"Document(id={self.id!r}, score={self.score:.4f}, text={self.text[:60]!r}...)"


class Query(BaseModel):
    """Represents an incoming user query."""

    text: str
    filters: Optional[Dict[str, Any]] = None  # ChromaDB metadata filters
    top_k: int = Field(default=5, ge=1, le=50)


class RetrievalResult(BaseModel):
    """Result from a single retrieval stage."""

    query: str
    documents: List[Document]
    retrieval_method: str  # "semantic" | "keyword" | "hybrid"
    retrieval_time_ms: float


class RAGResponse(BaseModel):
    """Final response returned to the caller."""

    query: str
    response: str
    sources: List[Document]
    confidence: float = Field(ge=0.0, le=1.0)
    retrieval_method: str
    total_time_ms: float
    citations: List[str] = Field(default_factory=list)


class HybridSearchResult(BaseModel):
    """Detailed output from the hybrid retriever."""

    semantic_results: List[Document]
    keyword_results: List[Document]
    fused_results: List[Document]
    method: str  # "rrf" | "weighted"
