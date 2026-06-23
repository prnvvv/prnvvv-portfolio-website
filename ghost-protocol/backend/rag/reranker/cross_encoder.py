"""
Cross-encoder reranker using sentence-transformers.
Scores (query, document) pairs directly — much more accurate than bi-encoder
cosine similarity for short result sets.

Falls back to HuggingFace pipeline if sentence-transformers is unavailable.
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
        Maximum token length for the cross-encoder input (text will be
        truncated automatically).
    """

    def __init__(
        self,
        model_name: str = _DEFAULT_MODEL,
        max_length: int = 512,
    ) -> None:
        self.model_name = model_name
        self.max_length = max_length
        self._model = None
        self._hf_pipeline = None
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
            scores = self._score_pairs(query, [doc.text for doc in documents])

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

    def _score_pairs(self, query: str, texts: List[str]) -> List[float]:
        """
        Score (query, text) pairs in batch without creating Document objects.

        Parameters
        ----------
        query : str
            The query string.
        texts : List[str]
            Document texts to score against the query.

        Returns
        -------
        List[float]
            Relevance scores, higher = more relevant.
        """
        if not texts:
            return []

        if self._model is not None:
            pairs = [(query, text) for text in texts]
            scores = self._model.predict(
                pairs,
                show_progress_bar=False,
                convert_to_numpy=True,
            )
            return [float(s) for s in scores]

        if self._hf_pipeline is not None:
            results = self._hf_pipeline(
                [(query, text) for text in texts],
                truncation=True,
                max_length=self.max_length,
            )
            scores = []
            for result in results:
                if isinstance(result, list):
                    relevant = [r for r in result if r.get("label") in ("LABEL_1", "RELEVANT", "1", "true", "positive")]
                    scores.append(float(relevant[0]["score"]) if relevant else float(result[-1]["score"]))
                else:
                    scores.append(float(result.get("score", 0.0)))
            return scores

        raise RuntimeError("No cross-encoder model loaded.")

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _load_model(self) -> None:
        """Attempt to load the cross-encoder model."""
        # Try sentence-transformers first (preferred)
        try:
            from sentence_transformers import CrossEncoder

            self._model = CrossEncoder(self.model_name, max_length=self.max_length)
            self._available = True
            logger.info("CrossEncoder loaded via sentence-transformers: %s", self.model_name)
            return
        except ImportError:
            logger.info(
                "sentence-transformers not installed; will try HuggingFace pipeline."
            )
        except Exception as exc:
            logger.warning(
                "Could not load cross-encoder model '%s' via sentence-transformers: %s",
                self.model_name,
                exc,
            )

        # Fallback to HuggingFace text-classification pipeline
        try:
            from transformers import pipeline

            self._hf_pipeline = pipeline(
                "text-classification",
                model=self.model_name,
                truncation=True,
                max_length=self.max_length,
                top_k=None,
            )
            self._available = True
            logger.info("CrossEncoder loaded via HuggingFace pipeline: %s", self.model_name)
        except ImportError:
            logger.warning(
                "transformers not installed; reranker disabled. "
                "Run: pip install transformers"
            )
        except Exception as exc:
            logger.warning(
                "Could not load cross-encoder model '%s' via pipeline: %s — reranker disabled.",
                self.model_name,
                exc,
            )
