"""
Keyword retriever implementing BM25 from scratch.
No external BM25 library required — pure Python + numpy.
"""

import logging
import math
import re
import time
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from rag.models.schemas import Document, RetrievalResult

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# BM25 implementation
# ---------------------------------------------------------------------------


class BM25:
    """
    Okapi BM25 scoring.

    Parameters
    ----------
    corpus : List[List[str]]
        Pre-tokenised corpus (list of token lists).
    k1 : float
        Term frequency saturation parameter (default 1.5).
    b : float
        Length normalisation parameter (default 0.75).
    """

    def __init__(
        self, corpus: List[List[str]], k1: float = 1.5, b: float = 0.75
    ) -> None:
        self.k1 = k1
        self.b = b
        self.corpus = corpus
        self.doc_count = len(corpus)

        # Document lengths
        self.doc_lengths = np.array([len(doc) for doc in corpus], dtype=np.float32)
        self.avg_doc_length = float(self.doc_lengths.mean()) if self.doc_count else 1.0

        # Build inverted index: term -> {doc_idx: term_freq}
        self._index: Dict[str, Dict[int, int]] = {}
        for idx, tokens in enumerate(corpus):
            for token in tokens:
                if token not in self._index:
                    self._index[token] = {}
                self._index[token][idx] = self._index[token].get(idx, 0) + 1

        # IDF cache
        self._idf_cache: Dict[str, float] = {}

    def _idf(self, term: str) -> float:
        """Smoothed inverse document frequency."""
        if term in self._idf_cache:
            return self._idf_cache[term]
        df = len(self._index.get(term, {}))
        idf = math.log((self.doc_count - df + 0.5) / (df + 0.5) + 1)
        self._idf_cache[term] = idf
        return idf

    def get_scores(self, query_tokens: List[str]) -> np.ndarray:
        """
        Compute BM25 scores for all documents given query tokens.

        Returns
        -------
        np.ndarray
            Score array of shape (doc_count,).
        """
        scores = np.zeros(self.doc_count, dtype=np.float32)

        for term in query_tokens:
            if term not in self._index:
                continue
            idf = self._idf(term)
            for doc_idx, tf in self._index[term].items():
                dl = self.doc_lengths[doc_idx]
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (1 - self.b + self.b * dl / self.avg_doc_length)
                scores[doc_idx] += idf * numerator / denominator

        return scores


# ---------------------------------------------------------------------------
# Retriever
# ---------------------------------------------------------------------------


class KeywordRetriever:
    """
    BM25-based keyword retriever backed by ChromaDB as the document store.

    The BM25 index is built lazily on first use and cached.

    Parameters
    ----------
    collection : chromadb.Collection
        ChromaDB collection to pull documents from.
    """

    def __init__(self, collection) -> None:
        self.collection = collection
        self._bm25: Optional[BM25] = None
        self._corpus_docs: List[Document] = []  # mirrors BM25 corpus order

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
            documents = self._bm25_search(query_text, top_k=top_k * 3)  # over-fetch for filtering

            # Post-filter by metadata
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
        """Fetch all docs from ChromaDB and build the BM25 index (cached)."""
        if self._bm25 is not None and not force_rebuild:
            return

        logger.info("Building BM25 index from ChromaDB collection …")
        try:
            raw = self.collection.get(include=["documents", "metadatas"])
        except Exception as exc:
            logger.error("Failed to fetch documents from ChromaDB: %s", exc)
            raise

        ids = raw.get("ids", [])
        texts = raw.get("documents", [])
        metadatas = raw.get("metadatas", [])

        self._corpus_docs = []
        tokenised_corpus: List[List[str]] = []

        for doc_id, text, meta in zip(ids, texts, metadatas):
            doc = Document(id=str(doc_id), text=text or "", metadata=meta or {})
            self._corpus_docs.append(doc)
            tokenised_corpus.append(self._tokenize(text or ""))

        self._bm25 = BM25(tokenised_corpus)
        logger.info("BM25 index built: %d documents", len(self._corpus_docs))

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _tokenize(self, text: str) -> List[str]:
        """
        Simple tokeniser:
        1. Lowercase
        2. Remove punctuation
        3. Split on whitespace
        4. Drop empty tokens
        """
        text = text.lower()
        text = re.sub(r"[^\w\s]", " ", text)
        return [t for t in text.split() if t]

    def _bm25_search(self, query_text: str, top_k: int) -> List[Document]:
        """Run BM25 scoring and return ranked Documents."""
        query_tokens = self._tokenize(query_text)
        if not query_tokens:
            return []

        scores: np.ndarray = self._bm25.get_scores(query_tokens)
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
