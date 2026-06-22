"""
Embedding generation with support for Sentence Transformers (local) and OpenAI.
Falls back gracefully if a provider is unavailable.
"""

import logging
from typing import List, Optional

logger = logging.getLogger(__name__)


class Embedder:
    """
    Unified embedding interface supporting:
    - Sentence Transformers (default, local, no API key needed)
    - OpenAI text-embedding-* models (requires OPENAI_API_KEY)

    Parameters
    ----------
    model_name : str
        SentenceTransformer model name or OpenAI model name.
    use_openai : bool
        If True, use OpenAI embeddings instead of local model.
    openai_api_key : str | None
        OpenAI API key. Falls back to OPENAI_API_KEY env var.
    """

    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2",
        use_openai: bool = False,
        openai_api_key: Optional[str] = None,
    ) -> None:
        self.model_name = model_name
        self.use_openai = use_openai
        self._model = None
        self._dimension: Optional[int] = None

        if use_openai:
            self._init_openai(openai_api_key)
        else:
            self._init_sentence_transformer()

    # ------------------------------------------------------------------
    # Initialisation helpers
    # ------------------------------------------------------------------

    def _init_sentence_transformer(self) -> None:
        """Load a local Sentence Transformer model."""
        try:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.model_name)
            self._dimension = self._model.get_sentence_embedding_dimension()
            logger.info(
                "SentenceTransformer loaded: %s  (dim=%d)", self.model_name, self._dimension
            )
        except ImportError:
            logger.error("sentence-transformers not installed. Run: pip install sentence-transformers")
            raise
        except Exception as exc:
            logger.error("Failed to load SentenceTransformer model '%s': %s", self.model_name, exc)
            raise

    def _init_openai(self, api_key: Optional[str]) -> None:
        """Configure OpenAI embeddings."""
        try:
            import openai
            import os

            openai.api_key = api_key or os.getenv("OPENAI_API_KEY")
            if not openai.api_key:
                raise ValueError("OpenAI API key not provided and OPENAI_API_KEY env var not set.")
            self._openai = openai
            logger.info("OpenAI embeddings configured: model=%s", self.model_name)
        except ImportError:
            logger.error("openai package not installed. Run: pip install openai")
            raise

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def embed_query(self, text: str) -> List[float]:
        """
        Embed a single query string.

        Parameters
        ----------
        text : str
            The query text to embed.

        Returns
        -------
        List[float]
            Embedding vector.
        """
        try:
            if self.use_openai:
                return self._openai_embed([text])[0]
            return self._model.encode(text, convert_to_list=True)
        except Exception as exc:
            logger.error("embed_query failed: %s", exc)
            raise

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Batch-embed a list of document strings.

        Parameters
        ----------
        texts : List[str]
            Documents to embed.

        Returns
        -------
        List[List[float]]
            List of embedding vectors.
        """
        if not texts:
            return []
        try:
            if self.use_openai:
                return self._openai_embed(texts)
            return self._model.encode(texts, convert_to_list=True, show_progress_bar=False)
        except Exception as exc:
            logger.error("embed_documents failed: %s", exc)
            raise

    def get_dimension(self) -> int:
        """Return the embedding dimension."""
        if self._dimension is None:
            raise RuntimeError("Embedder not properly initialised; dimension unknown.")
        return self._dimension

    def get_chroma_embedding_function(self):
        """
        Return a ChromaDB-compatible embedding function for use when
        creating/loading a ChromaDB collection.
        """
        if self.use_openai:
            from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
            import os

            return OpenAIEmbeddingFunction(
                api_key=self._openai.api_key or os.getenv("OPENAI_API_KEY"),
                model_name=self.model_name,
            )
        else:
            from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

            return SentenceTransformerEmbeddingFunction(model_name=self.model_name)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _openai_embed(self, texts: List[str]) -> List[List[float]]:
        """Call OpenAI embeddings API."""
        response = self._openai.embeddings.create(input=texts, model=self.model_name)
        return [item.embedding for item in response.data]
