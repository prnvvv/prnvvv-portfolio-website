"""
Cross-encoder reranker using sentence-transformers.
Scores (query, document) pairs directly — much more accurate than bi-encoder
cosine similarity for short result sets.
"""

import logging
import time
from typing import List, Optional

from rag.models.schemas import Document

logger = logging.getLogger(__name__)

_DEFAULT_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"


class CrossEncoderReranker:
    """
    Re-ranks a list of retrieved documents using a cross-encoder model.

    Parameters
    ----------
    model_name : str
        HuggingFace cross-encoder model identifier.
    max_length : int
        Maximum token length for the cross-encoder input.
    """

    def __init__(
        self,
        model_name: str = _DEFAULT_MODEL,
        max_length: int = 512,
    ) -> None:
        self.model_name = model_name
        self.max_length = max_length
        self._model = None
        self._available = False
        self._load_model()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def rerank(
        self,
        query: str,
        documents: List[Document],
        top_k: Optional[int] = None,
    ) -> List[Document]:
        """
        Re-rank documents by cross-encoder relevance score.

        Parameters
        ----------
        query : str
            The original user query.
        documents : List[Document]
            Candidate documents to re-rank.
        top_k : int | None
            If set, return only the top-k results.

        Returns
        -------
        List[Document]
            Documents sorted by cross-encoder score (descending).
        """
        if not documents:
            return documents

        if not self._available:
            logger.warning("Cross-encoder not available — returning documents unchanged.")
            return documents[:top_k] if top_k else documents

        start = time.perf_counter()
        logger.debug(
            "CrossEncoderReranker.rerank | query=%r  docs=%d", query, len(documents)
        )

        try:
            pairs = [(query, doc.text) for doc in documents]
            scores = self._model.predict(
                pairs,
                show_progress_bar=False,
                convert_to_numpy=True,
            )

            scored_docs: List[Document] = []
            for doc, score in zip(documents, scores):
                d = doc.model_copy()
                d.score = round(float(score), 4)
                scored_docs.append(d)

            scored_docs.sort(key=lambda d: d.score, reverse=True)

            elapsed_ms = (time.perf_counter() - start) * 1000
            logger.debug("Reranking done in %.1f ms", elapsed_ms)

            return scored_docs[:top_k] if top_k else scored_docs

        except Exception as exc:
            logger.error("Cross-encoder reranking failed: %s — returning original order.", exc)
            return documents[:top_k] if top_k else documents

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _load_model(self) -> None:
        """Attempt to load the cross-encoder model."""
        try:
            from sentence_transformers import CrossEncoder

            self._model = CrossEncoder(self.model_name, max_length=self.max_length)
            self._available = True
            logger.info("CrossEncoder loaded: %s", self.model_name)
        except ImportError:
            logger.warning(
                "sentence-transformers not installed; reranker disabled. "
                "Run: pip install sentence-transformers"
            )
        except Exception as exc:
            logger.warning(
                "Could not load cross-encoder model '%s': %s — reranker disabled.",
                self.model_name,
                exc,
            )
