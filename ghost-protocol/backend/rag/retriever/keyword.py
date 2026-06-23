"""
Keyword retriever using Qdrant's BM25 sparse embedding model.
Replaces the custom BM25 implementation with a HuggingFace-compatible model
loaded via FastEmbed (the intended way per the model card, since the
Qdrant/bm25 repo contains only stopword data — no neural weights).
"""

import logging
import re
import time
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from rag.models.schemas import Document, RetrievalResult

logger = logging.getLogger(__name__)


class KeywordRetriever:
    """
    BM25-based keyword retriever backed by ChromaDB as the document store.
    Uses the Qdrant/bm25 sparse embedding model via FastEmbed for scoring.

    Parameters
    ----------
    collection : chromadb.Collection
        ChromaDB collection to pull documents from.
    """

    def __init__(self, collection) -> None:
        self.collection = collection
        self._bm25_model = None
        self._corpus_docs: List[Document] = []  # mirrors BM25 corpus order
        self._doc_embeddings: List = []          # pre-computed sparse embeddings

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
        Retrieve documents using BM25 scoring.

        Parameters
        ----------
        query_text : str
            Raw query string.
        top_k : int
            Maximum number of results.
        filters : dict | None
            Post-retrieval metadata filter (key-value equality).

        Returns
        -------
        RetrievalResult
        """
        start = time.perf_counter()
        logger.debug("KeywordRetriever.retrieve | query=%r  top_k=%d", query_text, top_k)

        try:
            self._build_bm25_index()
            documents = self._bm25_search(query_text, top_k=top_k * 3)

            if filters:
                documents = self._apply_metadata_filter(documents, filters)

            documents = documents[:top_k]

        except Exception as exc:
            logger.error("BM25 search failed, falling back to simple keyword match: %s", exc)
            documents = self._fallback_keyword_search(query_text, top_k=top_k, filters=filters)

        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.debug("Keyword retrieval done in %.1f ms  (%d docs)", elapsed_ms, len(documents))

        return RetrievalResult(
            query=query_text,
            documents=documents,
            retrieval_method="keyword",
            retrieval_time_ms=round(elapsed_ms, 2),
        )

    # ------------------------------------------------------------------
    # Index construction
    # ------------------------------------------------------------------

    def _build_bm25_index(self, force_rebuild: bool = False) -> None:
        """Fetch all docs from ChromaDB and pre-compute BM25 sparse embeddings."""
        if self._bm25_model is not None and not force_rebuild:
            return

        logger.info("Loading Qdrant/bm25 model via FastEmbed …")
        try:
            from fastembed import SparseTextEmbedding

            self._bm25_model = SparseTextEmbedding(model_name="Qdrant/bm25")
        except ImportError:
            logger.error("fastembed not installed. Run: pip install fastembed")
            raise
        except Exception as exc:
            logger.error("Failed to load Qdrant/bm25 model: %s", exc)
            raise

        try:
            raw = self.collection.get(include=["documents", "metadatas"])
        except Exception as exc:
            logger.error("Failed to fetch documents from ChromaDB: %s", exc)
            raise

        ids = raw.get("ids", [])
        texts = raw.get("documents", [])
        metadatas = raw.get("metadatas", [])

        self._corpus_docs = []
        for doc_id, text, meta in zip(ids, texts, metadatas):
            doc = Document(id=str(doc_id), text=text or "", metadata=meta or {})
            self._corpus_docs.append(doc)

        doc_texts = [doc.text for doc in self._corpus_docs]
        self._doc_embeddings = list(self._bm25_model.embed(doc_texts))
        logger.info("BM25 index built: %d documents", len(self._corpus_docs))

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _tokenize(self, text: str) -> List[str]:
        """
        Simple tokeniser used by the fallback path:
        1. Lowercase
        2. Remove punctuation
        3. Split on whitespace
        4. Drop empty tokens
        """
        text = text.lower()
        text = re.sub(r"[^\w\s]", " ", text)
        return [t for t in text.split() if t]

    def _compute_sparse_scores(
        self,
        query_indices: np.ndarray,
        query_values: np.ndarray,
    ) -> np.ndarray:
        """
        Compute dot-product scores between a query sparse vector and all
        pre-computed document sparse vectors.

        Parameters
        ----------
        query_indices : np.ndarray
            Token indices from the query sparse embedding.
        query_values : np.ndarray
            Corresponding weights from the query sparse embedding.

        Returns
        -------
        np.ndarray
            Score array of shape (doc_count,).
        """
        scores = np.zeros(len(self._doc_embeddings), dtype=np.float32)

        q_index_to_val = dict(zip(query_indices, query_values))

        for doc_idx, doc_emb in enumerate(self._doc_embeddings):
            score = 0.0
            for idx, val in zip(doc_emb.indices, doc_emb.values):
                q_val = q_index_to_val.get(idx)
                if q_val is not None:
                    score += val * q_val
            scores[doc_idx] = score

        return scores

    def _bm25_search(self, query_text: str, top_k: int) -> List[Document]:
        """Run BM25 scoring via sparse embeddings and return ranked Documents."""
        query_embs = list(self._bm25_model.embed([query_text]))
        if not query_embs:
            return []

        query_emb = query_embs[0]
        scores = self._compute_sparse_scores(query_emb.indices, query_emb.values)
        top_indices = scores.argsort()[::-1][:top_k]

        results: List[Document] = []
        for idx in top_indices:
            bm25_score = float(scores[idx])
            if bm25_score <= 0:
                break
            doc = self._corpus_docs[idx].model_copy()
            doc.score = round(bm25_score, 4)
            results.append(doc)

        return results

    def _apply_metadata_filter(
        self, documents: List[Document], filters: Dict[str, Any]
    ) -> List[Document]:
        """Keep only documents whose metadata matches all filter key-value pairs."""
        filtered: List[Document] = []
        for doc in documents:
            if all(doc.metadata.get(k) == v for k, v in filters.items()):
                filtered.append(doc)
        return filtered

    def _fallback_keyword_search(
        self,
        query_text: str,
        top_k: int,
        filters: Optional[Dict[str, Any]],
    ) -> List[Document]:
        """
        Simple contains-based keyword search used as a safety fallback
        if BM25 index construction fails.
        """
        logger.warning("Using fallback keyword search for query: %r", query_text)
        query_tokens = self._tokenize(query_text)
        results: List[Tuple[Document, int]] = []

        for doc in self._corpus_docs:
            doc_tokens = set(self._tokenize(doc.text))
            hits = sum(1 for t in query_tokens if t in doc_tokens)
            if hits > 0:
                results.append((doc, hits))

        results.sort(key=lambda x: x[1], reverse=True)
        docs = []
        for doc, hits in results[:top_k]:
            d = doc.model_copy()
            d.score = float(hits)
            docs.append(d)

        if filters:
            docs = self._apply_metadata_filter(docs, filters)

        return docs[:top_k]
