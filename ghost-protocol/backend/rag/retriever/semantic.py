"""
Semantic (vector) retriever using ChromaDB.
Performs cosine / L2 similarity search against embedded document chunks.
"""

import logging
import time
from typing import Any, Dict, List, Optional

from rag.embeddings.embedder import Embedder
from rag.models.schemas import Document, RetrievalResult

logger = logging.getLogger(__name__)


class SemanticRetriever:
    """
    Retrieves documents from ChromaDB via vector similarity search.

    Parameters
    ----------
    collection : chromadb.Collection
        An initialised ChromaDB collection.
    embedder : Embedder
        Embedder instance used to encode queries.
    """

    def __init__(self, collection, embedder: Embedder) -> None:
        self.collection = collection
        self.embedder = embedder

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def retrieve(
        self,
        query_text: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
    ) -> RetrievalResult:
        """
        Run vector similarity search.

        Parameters
        ----------
        query_text : str
            Natural language query.
        top_k : int
            Number of results to return.
        filters : dict | None
            Optional ChromaDB `where` clause for metadata filtering.

        Returns
        -------
        RetrievalResult
        """
        start = time.perf_counter()
        logger.debug("SemanticRetriever.retrieve | query=%r  top_k=%d", query_text, top_k)

        try:
            query_embedding = self.embedder.embed_query(query_text)
            chroma_kwargs: Dict[str, Any] = {
                "query_embeddings": [query_embedding],
                "n_results": top_k,
                "include": ["documents", "metadatas", "distances"],
            }
            if filters:
                chroma_kwargs["where"] = filters

            raw = self.collection.query(**chroma_kwargs)
            documents = self._parse_chroma_results(raw)

        except Exception as exc:
            logger.error("SemanticRetriever.retrieve failed: %s", exc)
            documents = []

        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.debug("Semantic retrieval done in %.1f ms  (%d docs)", elapsed_ms, len(documents))

        return RetrievalResult(
            query=query_text,
            documents=documents,
            retrieval_method="semantic",
            retrieval_time_ms=round(elapsed_ms, 2),
        )

    def retrieve_with_metadata_filter(
        self,
        query_text: str,
        document_type: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 5,
        extra_filters: Optional[Dict[str, Any]] = None,
    ) -> RetrievalResult:
        """
        Convenience wrapper that builds a ChromaDB `where` clause from
        common metadata fields before delegating to `retrieve()`.
        """
        where: Dict[str, Any] = {}

        if document_type:
            where["document_type"] = {"$eq": document_type}
        if category:
            where["category"] = {"$eq": category}
        if extra_filters:
            where.update(extra_filters)

        return self.retrieve(query_text, top_k=top_k, filters=where or None)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _parse_chroma_results(self, raw: Dict[str, Any]) -> List[Document]:
        """Convert raw ChromaDB query output into Document objects."""
        docs: List[Document] = []

        ids = raw.get("ids", [[]])[0]
        texts = raw.get("documents", [[]])[0]
        metadatas = raw.get("metadatas", [[]])[0]
        distances = raw.get("distances", [[]])[0]

        for doc_id, text, meta, dist in zip(ids, texts, metadatas, distances):
            # Normalise distance to a 0–1 relevance score (lower dist = higher score)
            score = max(0.0, 1.0 - dist) if dist is not None else 0.0
            docs.append(
                Document(
                    id=str(doc_id),
                    text=text or "",
                    metadata=meta or {},
                    distance=dist,
                    score=round(score, 4),
                )
            )

        return docs
