"""
RAG Pipeline Orchestrator
=========================
Ties together query expansion → hybrid retrieval → reranking → response
generation for the portfolio AI assistant.
"""

import logging
import os
import time
from typing import Any, Dict, List, Optional

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from rag.embeddings.embedder import Embedder
from rag.models.schemas import Document, RAGResponse
from rag.query_rewrite.expander import QueryExpander
from rag.reranker.cross_encoder import CrossEncoderReranker
from rag.retriever.hybrid import HybridRetriever
from rag.retriever.keyword import KeywordRetriever
from rag.retriever.semantic import SemanticRetriever

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Intent detection vocabulary
# ---------------------------------------------------------------------------

_INTENT_KEYWORDS: Dict[str, List[str]] = {
    "project":      ["project", "built", "developed", "app", "application", "system", "tool", "repo"],
    "skill":        ["skill", "technology", "tech", "stack", "know", "proficient", "expertise", "language", "framework"],
    "experience":   ["experience", "work", "job", "role", "position", "internship", "company", "employer"],
    "education":    ["education", "degree", "university", "college", "study", "gpa", "course"],
    "certification":["certification", "cert", "certified", "credential", "badge", "course"],
    "achievement":  ["achievement", "award", "recognition", "won", "prize", "accomplishment", "hackathon"],
    "contact":      ["contact", "email", "linkedin", "github", "reach", "connect", "social", "hire"],
    "research":     ["research", "paper", "publication", "patent", "study", "thesis"],
}

# Topics that are clearly unrelated to a developer portfolio
_OUT_OF_SCOPE_KEYWORDS: List[str] = [
    "weather", "news", "sports", "recipe", "cook", "movie", "music", "song",
    "stock", "crypto", "bitcoin", "politics", "celebrity", "game", "joke",
]

# Minimum aggregate context score to attempt a response
_CONFIDENCE_THRESHOLD = 0.05


class RAGPipeline:
    """
    End-to-end RAG pipeline for a personal portfolio assistant.

    Parameters
    ----------
    chroma_collection : chromadb.Collection
        Initialised ChromaDB collection.
    embedding_model : str
        Sentence Transformer model name.
    semantic_weight : float
        RRF weight for semantic branch.
    keyword_weight : float
        RRF weight for keyword branch.
    top_k : int
        Final number of context documents passed to response generation.
    use_reranker : bool
        Whether to apply cross-encoder reranking.
    use_query_expansion : bool
        Whether to apply rule-based query expansion.
    cross_encoder_model : str
        HuggingFace cross-encoder model identifier.
    retrieval_mode : str
        Default retrieval mode — "hybrid", "semantic", or "keyword".
    use_llm : bool
        Whether to use Groq LLM for response generation.
    llm_model_name : str
        Groq model name (e.g. "llama-3.3-70b-versatile").
    llm_api_key : str | None
        Groq API key. Falls back to GROQ_API_KEY env var.
    """

    def __init__(
        self,
        chroma_collection,
        embedding_model: str = "all-MiniLM-L6-v2",
        semantic_weight: float = 0.7,
        keyword_weight: float = 0.3,
        top_k: int = 5,
        use_reranker: bool = True,
        use_query_expansion: bool = True,
        cross_encoder_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2",
        retrieval_mode: str = "hybrid",
        use_llm: bool = False,
        llm_model_name: str = "llama-3.3-70b-versatile",
        llm_api_key: Optional[str] = None,
    ) -> None:
        self.top_k = top_k
        self.use_reranker = use_reranker
        self.use_query_expansion = use_query_expansion
        self.retrieval_mode = retrieval_mode
        self.use_llm = use_llm

        logger.info("Initialising RAGPipeline …")

        # Component initialisation
        self.embedder = Embedder(model_name=embedding_model)
        self.expander = QueryExpander()

        semantic = SemanticRetriever(chroma_collection, self.embedder)
        keyword = KeywordRetriever(chroma_collection)

        self.retriever = HybridRetriever(
            semantic_retriever=semantic,
            keyword_retriever=keyword,
            semantic_weight=semantic_weight,
            keyword_weight=keyword_weight,
        )

        self.reranker = CrossEncoderReranker(model_name=cross_encoder_model) if use_reranker else None

        if use_llm:
            self._init_llm(llm_model_name, llm_api_key)
        else:
            self._llm = None
            self._response_chain = None

        logger.info("RAGPipeline ready.")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def query(
        self,
        query_text: str,
        filters: Optional[Dict[str, Any]] = None,
        top_k: Optional[int] = None,
        mode: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Main entry point.  Run the full RAG pipeline for a user query.

        Parameters
        ----------
        query_text : str
            Natural language question.
        filters : dict | None
            Optional ChromaDB metadata filters, e.g. {"document_type": "project"}.
        top_k : int | None
            Override the default top_k.
        mode : str | None
            Override the default retrieval_mode.

        Returns
        -------
        dict
            Keys: query, response, sources (list of dicts), confidence,
                  retrieval_method, total_time_ms, citations.
        """
        wall_start = time.perf_counter()
        k = top_k or self.top_k
        retrieval_mode = mode or self.retrieval_mode

        logger.info("RAGPipeline.query | %r", query_text)

        # 1. Scope check — reject off-topic questions immediately
        if self._is_out_of_scope(query_text):
            return self._scope_rejection_response(query_text)

        # 2. Query expansion
        retrieval_query = query_text
        if self.use_query_expansion:
            if self.use_llm and self._llm:
                retrieval_query = self.expander.expand_with_llm(
                    query_text,
                    lambda p: self._llm.invoke(p).content,
                )
            else:
                retrieval_query = self.expander.expand(query_text)
            logger.debug("Expanded query: %r", retrieval_query)

        # 3. Intent detection
        intent = self._detect_intent(query_text)
        logger.debug("Detected intent: %s", intent)

        # 4. Retrieval
        try:
            retrieval_result = self.retriever.retrieve(
                query_text=retrieval_query,
                top_k=k * 2,  # over-fetch so reranker has room
                filters=filters,
                mode=retrieval_mode,
            )
            documents = retrieval_result.documents
        except Exception as exc:
            logger.error("Retrieval failed: %s", exc)
            return self._error_response(query_text, str(exc))

        # 5. Reranking
        if self.reranker and documents:
            try:
                documents = self.reranker.rerank(query_text, documents, top_k=k)
            except Exception as exc:
                logger.warning("Reranking failed, using retrieval order: %s", exc)
                documents = documents[:k]
        else:
            documents = documents[:k]

        # 6. Context validation
        confidence = self._compute_confidence(documents)
        if confidence < _CONFIDENCE_THRESHOLD or not documents:
            return self._no_context_response(query_text)

        # 7. Build response
        response_text, citations = self._build_response(query_text, documents, intent)

        total_ms = (time.perf_counter() - wall_start) * 1000

        return RAGResponse(
            query=query_text,
            response=response_text,
            sources=documents,
            confidence=round(confidence, 4),
            retrieval_method=retrieval_result.retrieval_method,
            total_time_ms=round(total_ms, 2),
            citations=citations,
        ).model_dump()

    # ------------------------------------------------------------------
    # LLM initialisation
    # ------------------------------------------------------------------

    def _init_llm(self, model_name: str, api_key: Optional[str]) -> None:
        """Configure Groq LLM via LangChain for response generation."""
        key = api_key or os.getenv("GROQ_API_KEY")
        if not key:
            raise ValueError("Groq API key not provided and GROQ_API_KEY env var not set.")
        self._llm = ChatGroq(model_name=model_name, temperature=0.7, api_key=key)
        parser = JsonOutputParser(pydantic_object={
            "type": "object",
            "properties": {
                "response": {"type": "string"},
            },
            "required": ["response"],
        })
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful portfolio assistant. Answer the user's question based on the provided context documents.\nReturn your response as JSON with this exact structure:\n{{\n    \"response\": \"your natural language answer here\"\n}}"),
            ("user", "Context:\n{context}\n\nQuestion: {query}"),
        ])
        self._response_chain = prompt | self._llm | parser
        logger.info("Groq LLM initialised: model=%s", model_name)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _detect_intent(self, query: str) -> str:
        """
        Map query text to one of the known portfolio intent categories.
        Returns "general" when no category matches.
        """
        lowered = query.lower()
        best_intent = "general"
        best_hits = 0

        for intent, keywords in _INTENT_KEYWORDS.items():
            hits = sum(1 for kw in keywords if kw in lowered)
            if hits > best_hits:
                best_hits = hits
                best_intent = intent

        return best_intent

    def _is_out_of_scope(self, query: str) -> bool:
        """Return True if the query is clearly unrelated to the portfolio."""
        lowered = query.lower()
        return any(kw in lowered for kw in _OUT_OF_SCOPE_KEYWORDS)

    def _compute_confidence(self, documents: List[Document]) -> float:
        """
        Estimate answer confidence from the top document scores.
        Uses a weighted average with linear decay.
        """
        if not documents:
            return 0.0

        weights = [1.0 / (i + 1) for i in range(len(documents))]
        scores = [doc.score or 0.0 for doc in documents]
        weighted_sum = sum(w * s for w, s in zip(weights, scores))
        weight_total = sum(weights)
        raw = weighted_sum / weight_total if weight_total else 0.0

        # Normalise to [0, 1] using a soft cap at score = 2.0 (BM25 scores can be large)
        return min(1.0, raw / 2.0) if raw > 1.0 else raw

    def _build_response(
        self,
        query: str,
        documents: List[Document],
        intent: str,
    ):
        """
        Construct a response and citation list from context documents.
        Uses the Groq LLM when enabled, otherwise falls back to a
        deterministic template.
        """
        if self.use_llm and self._llm:
            return self._llm_build_response(query, documents)

        # Fallback deterministic response
        context_parts: List[str] = []
        citations: List[str] = []

        for i, doc in enumerate(documents, start=1):
            doc_type = doc.metadata.get("document_type", "")
            title = doc.metadata.get("title") or doc.metadata.get("name") or f"Source {i}"
            context_parts.append(f"[{i}] {doc.text.strip()}")
            citations.append(f"[{i}] {title} ({doc_type})" if doc_type else f"[{i}] {title}")

        context_block = "\n\n".join(context_parts)

        # Intent-specific preamble
        preamble_map = {
            "project":      "Here are the relevant projects from the portfolio:",
            "skill":        "Here are the relevant skills and technologies:",
            "experience":   "Here is the relevant work experience:",
            "education":    "Here is the education background:",
            "certification":"Here are the relevant certifications:",
            "achievement":  "Here are the relevant achievements and awards:",
            "contact":      "Here is the contact / social information:",
            "research":     "Here is the relevant research and publications:",
            "general":      "Here is the relevant information from the portfolio:",
        }
        preamble = preamble_map.get(intent, preamble_map["general"])

        response = f"{preamble}\n\n{context_block}"
        return response, citations

    def _llm_build_response(
        self,
        query: str,
        documents: List[Document],
    ):
        """Build response via Groq LLM with structured JSON output."""
        context_parts: List[str] = []
        citations: List[str] = []

        for i, doc in enumerate(documents, start=1):
            doc_type = doc.metadata.get("document_type", "")
            title = doc.metadata.get("title") or doc.metadata.get("name") or f"Source {i}"
            context_parts.append(f"[{i}] {doc.text.strip()}")
            citations.append(f"[{i}] {title} ({doc_type})" if doc_type else f"[{i}] {title}")

        context_block = "\n\n".join(context_parts)

        result = self._response_chain.invoke({"context": context_block, "query": query})
        return result.get("response", ""), citations

    # ------------------------------------------------------------------
    # Standard non-success responses
    # ------------------------------------------------------------------

    def _scope_rejection_response(self, query: str) -> Dict[str, Any]:
        return {
            "query": query,
            "response": (
                "⚠️  This assistant is scoped to questions about the portfolio — "
                "projects, skills, experience, education, certifications, and achievements. "
                "Your question appears to be outside that scope."
            ),
            "sources": [],
            "confidence": 0.0,
            "retrieval_method": "none",
            "total_time_ms": 0.0,
            "citations": [],
        }

    def _no_context_response(self, query: str) -> Dict[str, Any]:
        return {
            "query": query,
            "response": (
                "I couldn't find relevant information in the portfolio to answer your question. "
                "Try rephrasing, or ask about a specific project, skill, or experience."
            ),
            "sources": [],
            "confidence": 0.0,
            "retrieval_method": "hybrid",
            "total_time_ms": 0.0,
            "citations": [],
        }

    def _error_response(self, query: str, error: str) -> Dict[str, Any]:
        return {
            "query": query,
            "response": "An internal error occurred while processing your query. Please try again.",
            "sources": [],
            "confidence": 0.0,
            "retrieval_method": "error",
            "total_time_ms": 0.0,
            "citations": [],
            "_error": error,
        }
