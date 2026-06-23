"""
Embedding generation with support for HuggingFace (local), HuggingFace Endpoint
(hosted), and Groq.  Falls back gracefully if a provider is unavailable.
"""

import logging
from typing import List, Optional

logger = logging.getLogger(__name__)


class Embedder:
    """
    Unified embedding interface supporting:
    - HuggingFace local models (via langchain-huggingface, default)
    - Groq text-embedding models (requires GROQ_API_KEY)
    - HuggingFace Inference Endpoint (optional, via HuggingFaceEndpointEmbeddings)

    Parameters
    ----------
    model_name : str
        HuggingFace model name or Groq model name.
    use_groq : bool
        If True, use Groq embeddings instead of local model.
    groq_api_key : str | None
        Groq API key. Falls back to GROQ_API_KEY env var.
    use_hf_endpoint : bool
        If True, use HuggingFace Inference Endpoint embeddings instead of local.
    hf_endpoint_url : str | None
        HuggingFace Inference Endpoint URL.
    hf_api_token : str | None
        HuggingFace API token. Falls back to HF_API_TOKEN env var.
    """

    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2",
        use_groq: bool = False,
        groq_api_key: Optional[str] = None,
        use_hf_endpoint: bool = False,
        hf_endpoint_url: Optional[str] = None,
        hf_api_token: Optional[str] = None,
    ) -> None:
        self.model_name = model_name
        self.use_groq = use_groq
        self._model = None
        self._dimension: Optional[int] = None

        if use_groq:
            self._init_groq(groq_api_key)
        elif use_hf_endpoint:
            self._init_hf_endpoint(hf_endpoint_url, hf_api_token)
        else:
            self._init_huggingface()

    # ------------------------------------------------------------------
    # Initialisation helpers
    # ------------------------------------------------------------------

    def _init_huggingface(self) -> None:
        """Load a local HuggingFace model via langchain-huggingface."""
        try:
            from langchain_huggingface import HuggingFaceEmbeddings

            model_kwargs = {"device": "cpu"}
            encode_kwargs = {"normalize_embeddings": True}

            self._model = HuggingFaceEmbeddings(
                model_name=self.model_name,
                model_kwargs=model_kwargs,
                encode_kwargs=encode_kwargs,
            )
            self._dimension = len(self._model.embed_query("test"))
            logger.info(
                "HuggingFaceEmbeddings loaded: %s  (dim=%d)",
                self.model_name, self._dimension,
            )
        except ImportError:
            logger.error(
                "langchain-huggingface not installed. Run: pip install langchain-huggingface"
            )
            raise
        except Exception as exc:
            logger.error("Failed to load HuggingFace model '%s': %s", self.model_name, exc)
            raise

    def _init_hf_endpoint(self, endpoint_url: Optional[str], api_token: Optional[str]) -> None:
        """Configure HuggingFace Inference Endpoint embeddings."""
        try:
            from langchain_huggingface import HuggingFaceEndpointEmbeddings
            import os

            url = endpoint_url or os.getenv("HF_ENDPOINT_URL")
            token = api_token or os.getenv("HF_API_TOKEN")

            if not url:
                raise ValueError(
                    "HF endpoint URL not provided and HF_ENDPOINT_URL env var not set."
                )

            self._model = HuggingFaceEndpointEmbeddings(
                model=self.model_name,
                endpoint_url=url,
                huggingfacehub_api_token=token,
            )
            self._dimension = len(self._model.embed_query("test"))
            logger.info(
                "HuggingFaceEndpointEmbeddings configured: model=%s  endpoint=%s",
                self.model_name, url,
            )
        except ImportError:
            logger.error(
                "langchain-huggingface not installed. Run: pip install langchain-huggingface"
            )
            raise
        except Exception as exc:
            logger.error("Failed to configure HF endpoint '%s': %s", self.model_name, exc)
            raise

    def _init_groq(self, api_key: Optional[str]) -> None:
        """Configure Groq embeddings."""
        try:
            from groq import Groq
            import os

            key = api_key or os.getenv("GROQ_API_KEY")
            if not key:
                raise ValueError("Groq API key not provided and GROQ_API_KEY env var not set.")
            self._groq_client = Groq(api_key=key)
            logger.info("Groq embeddings configured: model=%s", self.model_name)
        except ImportError:
            logger.error("groq package not installed. Run: pip install groq")
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
            if self.use_groq:
                return self._groq_embed([text])[0]
            return self._model.embed_query(text)
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
            if self.use_groq:
                return self._groq_embed(texts)
            return self._model.embed_documents(texts)
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

        For local models, wraps the HuggingFaceEmbeddings instance in a
        callable conforming to ChromaDB's embedding function signature.
        """
        if self.use_groq:
            from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
            import os

            return OpenAIEmbeddingFunction(
                api_key=self._groq_client.api_key or os.getenv("GROQ_API_KEY"),
                model_name=self.model_name,
                api_base="https://api.groq.com/openai/v1",
            )

        class _HFEmbeddingFunction:
            """Minimal ChromaDB-compatible wrapper around HuggingFaceEmbeddings."""

            def __init__(self, model):
                self._model = model

            def __call__(self, input: List[str]) -> List[List[float]]:
                return self._model.embed_documents(input)

        return _HFEmbeddingFunction(self._model)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _groq_embed(self, texts: List[str]) -> List[List[float]]:
        """Call Groq embeddings API."""
        response = self._groq_client.embeddings.create(input=texts, model=self.model_name)
        return [item.embedding for item in response.data]
