"""
Query expansion and rewriting module.
Improves recall by removing stop/question words and injecting synonyms.
"""

import logging
import re
from typing import Dict, List, Optional, Set

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Static configuration
# ---------------------------------------------------------------------------

# Words that add no retrieval value
_QUESTION_WORDS: Set[str] = {
    "what", "which", "who", "whom", "whose", "when", "where", "why", "how",
    "can", "could", "would", "should", "do", "does", "did", "is", "are",
    "was", "were", "have", "has", "had", "tell", "me", "about", "please",
    "you", "your", "the", "a", "an",
}

# Domain-specific synonym expansions
_SYNONYM_MAP: Dict[str, List[str]] = {
    # Programming languages
    "python":       ["py", "django", "flask", "fastapi", "pytorch", "tensorflow"],
    "javascript":   ["js", "typescript", "ts", "node", "nodejs", "react", "vue"],
    "java":         ["spring", "springboot", "jvm", "kotlin"],
    "cpp":          ["c++", "c plus plus", "systems programming"],
    "sql":          ["database", "postgres", "mysql", "sqlite", "postgresql"],

    # Frameworks / tools
    "react":        ["reactjs", "react.js", "frontend", "ui", "component"],
    "ml":           ["machine learning", "deep learning", "ai", "artificial intelligence"],
    "nlp":          ["natural language processing", "text", "language model"],

    # Portfolio concepts
    "project":      ["work", "built", "developed", "implemented", "application", "app", "system"],
    "skill":        ["expertise", "proficiency", "technology", "tech stack", "knowledge"],
    "experience":   ["background", "career", "work history", "job", "position", "role"],
    "education":    ["degree", "university", "college", "study", "academic"],
    "certification":["cert", "certified", "certificate", "course", "credential"],
    "achievement":  ["award", "recognition", "accomplishment", "won", "prize"],
    "internship":   ["intern", "industrial training", "apprenticeship"],
    "research":     ["paper", "publication", "study", "thesis", "analysis"],
    "contact":      ["email", "linkedin", "github", "reach", "connect", "social"],
}


class QueryExpander:
    """
    Expands and rewrites queries to improve retrieval recall.

    Supports:
    - Question-word removal
    - Synonym injection
    - Optional LLM-based expansion (if a callable is provided)
    """

    def __init__(self) -> None:
        pass

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def expand(self, query: str, inject_synonyms: bool = True) -> str:
        """
        Full expansion pipeline:
        1. Strip question words
        2. Inject synonyms

        Parameters
        ----------
        query : str
            Raw user query.
        inject_synonyms : bool
            Whether to append synonym terms.

        Returns
        -------
        str
            Expanded query string.
        """
        cleaned = self._remove_question_words(query)
        if inject_synonyms:
            cleaned = self._add_synonyms(cleaned)
        logger.debug("Query expanded: %r → %r", query, cleaned)
        return cleaned

    def rewrite_for_retrieval(self, query: str) -> str:
        """
        Lightweight rewrite focused on retrieval keywords.
        Removes noise words without synonym expansion (faster path).
        """
        return self._remove_question_words(query)

    def expand_with_llm(
        self,
        query: str,
        llm_fn,  # Callable[[str], str]
        fallback_to_rule: bool = True,
    ) -> str:
        """
        Use an LLM to generate an enriched query.

        Parameters
        ----------
        query : str
            Original query.
        llm_fn : Callable[[str], str]
            Function that accepts a prompt and returns a string response.
        fallback_to_rule : bool
            If the LLM call fails, fall back to rule-based expansion.

        Returns
        -------
        str
            LLM-expanded query, or rule-based expansion on failure.
        """
        prompt = (
            f"Rewrite the following question as a keyword-rich search query "
            f"for a developer portfolio retrieval system. "
            f"Return ONLY the rewritten query — no explanation.\n\nQuestion: {query}"
        )
        try:
            expanded = llm_fn(prompt).strip()
            logger.debug("LLM query expansion: %r → %r", query, expanded)
            return expanded
        except Exception as exc:
            logger.warning("LLM expansion failed: %s — using rule-based fallback.", exc)
            return self.expand(query) if fallback_to_rule else query

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _remove_question_words(self, query: str) -> str:
        """Strip leading question words and common filler words."""
        tokens = re.sub(r"[^\w\s]", " ", query.lower()).split()
        content_tokens = [t for t in tokens if t not in _QUESTION_WORDS]
        return " ".join(content_tokens) if content_tokens else query.lower()

    def _add_synonyms(self, cleaned_query: str) -> str:
        """
        For each token present in the synonym map, append its synonyms
        to the query string (space-separated, no duplicates).
        """
        tokens = cleaned_query.split()
        extras: List[str] = []
        seen: Set[str] = set(tokens)

        for token in tokens:
            for synonym in _SYNONYM_MAP.get(token, []):
                if synonym not in seen:
                    extras.append(synonym)
                    seen.add(synonym)

        if extras:
            return cleaned_query + " " + " ".join(extras)
        return cleaned_query
