"""
Hybrid retriever combining semantic and keyword results via
Reciprocal Rank Fusion (RRF).
"""

import logging
import time
from typing import Any, Dict, List, Optional

from rag.models.schemas import Document, HybridSearchResult, RetrievalResult
from rag.retriever.keyword import KeywordRetriever
from rag.retriever.semantic import SemanticRetriever

logger = logging.getLogger(__name__)

# RRF smoothing constant — typically 60 (Robertson et al.)
_RRF_K = 60


class HybridRetriever:
    """
    Combines SemanticRetriever and KeywordRetriever with Reciprocal Rank
    Fusion (RRF) for robust, complementary retrieval.

    Parameters
    ----------
    semantic_retriever : SemanticRetriever
    keyword_retriever : KeywordRetriever
    semantic_weight : float
        Weight applied to RRF scores from the semantic branch (default 0.7).
    keyword_weight : float
        Weight applied to RRF scores from the keyword branch (default 0.3).
    """

    def __init__(
        self,
        semantic_retriever: SemanticRetriever,
        keyword_retriever: KeywordRetriever,
        semantic_weight: float = 0.7,
        keyword_weight: float = 0.3,
    ) -> None:
        self.semantic = semantic_retriever
        self.keyword = keyword_retriever
        self.semantic_weight = semantic_weight
        self.keyword_weight = keyword_weight

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def retrieve(
        self,
        query_text: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
        mode: str = "hybrid",
    ) -> RetrievalResult:
        """
        Run hybrid retrieval.

        Parameters
        ----------
        query_text : str
            User query.
        top_k : int
            Final number of results to return.
        filters : dict | None
            Metadata filters forwarded to both retrievers.
        mode : str
            One of "hybrid", "semantic", or "keyword".

        Returns
        -------
        RetrievalResult
        """
        start = time.perf_counter()
        logger.debug(
            "HybridRetriever.retrieve | query=%r  top_k=%d  mode=%s", query_text, top_k, mode
        )

        if mode == "semantic":
            result = self.semantic.retrieve(query_text, top_k=top_k, filters=filters)
            result.retrieval_method = "semantic"
            return result

        if mode == "keyword":
            result = self.keyword.retrieve(query_text, top_k=top_k, filters=filters)
            result.retrieval_method = "keyword"
            return result

        # --- Hybrid ---
        # Over-fetch from both branches to give RRF room to reorder
        fetch_k = top_k * 3

        sem_result = self.semantic.retrieve(query_text, top_k=fetch_k, filters=filters)
        kw_result = self.keyword.retrieve(query_text, top_k=fetch_k, filters=filters)

        fused = self._reciprocal_rank_fusion(
            sem_result.documents, kw_result.documents, top_k=top_k
        )

        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.debug("Hybrid retrieval done in %.1f ms  (%d docs)", elapsed_ms, len(fused))

        return RetrievalResult(
            query=query_text,
            documents=fused,
            retrieval_method="hybrid",
            retrieval_time_ms=round(elapsed_ms, 2),
        )

    def retrieve_with_intent(
        self,
        query_text: str,
        intent: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
    ) -> HybridSearchResult:
        """
        Retrieve and expose all three result sets (semantic, keyword, fused)
        for debugging / analysis.  The intent can influence mode selection.

        Parameters
        ----------
        intent : str
            Detected query intent (e.g. "project", "skill", "experience").
        """
        # Keyword-heavy intents benefit from exact-match retrieval
        keyword_intents = {"certification", "tool", "technology"}
        mode = "keyword" if intent in keyword_intents else "hybrid"

        fetch_k = top_k * 3
        sem_docs = self.semantic.retrieve(query_text, top_k=fetch_k, filters=filters).documents
        kw_docs = self.keyword.retrieve(query_text, top_k=fetch_k, filters=filters).documents
        fused_docs = self._reciprocal_rank_fusion(sem_docs, kw_docs, top_k=top_k)

        return HybridSearchResult(
            semantic_results=sem_docs[:top_k],
            keyword_results=kw_docs[:top_k],
            fused_results=fused_docs,
            method="rrf",
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _reciprocal_rank_fusion(
        self,
        semantic_docs: List[Document],
        keyword_docs: List[Document],
        top_k: int,
    ) -> List[Document]:
        """
        Fuse two ranked lists using weighted Reciprocal Rank Fusion.

        RRF score for document d:
            rrf(d) = Σ  weight_i / (k + rank_i(d))
        where rank_i is the 1-based rank of d in list i.

        Parameters
        ----------
        semantic_docs : List[Document]
            Ranked results from the semantic branch.
        keyword_docs : List[Document]
            Ranked results from the keyword branch.
        top_k : int
            Number of fused results to return.

        Returns
        -------
        List[Document]
        """
        rrf_scores: Dict[str, float] = {}
        doc_map: Dict[str, Document] = {}

        def _accumulate(docs: List[Document], weight: float) -> None:
            for rank, doc in enumerate(docs, start=1):
                rrf_score = weight / (_RRF_K + rank)
                rrf_scores[doc.id] = rrf_scores.get(doc.id, 0.0) + rrf_score
                doc_map[doc.id] = doc  # last write wins (same doc, different branches)

        _accumulate(semantic_docs, self.semantic_weight)
        _accumulate(keyword_docs, self.keyword_weight)

        sorted_ids = sorted(rrf_scores, key=lambda d: rrf_scores[d], reverse=True)

        fused: List[Document] = []
        for doc_id in sorted_ids[:top_k]:
            doc = doc_map[doc_id].model_copy()
            doc.score = round(rrf_scores[doc_id], 6)
            fused.append(doc)

        return fused
