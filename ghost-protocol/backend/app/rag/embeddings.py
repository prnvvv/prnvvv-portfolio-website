"""Embeddings for retrieval.

Two interchangeable backends producing the same 384-d all-MiniLM-L6-v2 vectors (so an existing
index stays valid when switching):

* Hugging Face Inference Providers (used when HF_TOKEN is set): no torch / model in memory,
  which is what lets the backend fit on small hosts.
* Local sentence-transformers (fallback when no token is set): needs `requirements-local.txt`.
"""
from __future__ import annotations

import threading
from typing import Sequence

import numpy as np

HF_BATCH_SIZE = 32


class Embedder:
    def __init__(self, model_name: str, hf_token: str = "", timeout: float = 30.0):
        self.model_name = model_name
        self.hf_token = (hf_token or "").strip()
        self.timeout = timeout
        self._model = None
        self._client = None
        self._dim: int | None = None
        self._lock = threading.Lock()

    @property
    def uses_remote(self) -> bool:
        return bool(self.hf_token)

    # ---- local backend ----------------------------------------------------
    def _load(self):
        if self._model is None:
            with self._lock:
                if self._model is None:
                    try:
                        from sentence_transformers import SentenceTransformer
                    except ImportError as e:  # pragma: no cover
                        raise RuntimeError(
                            "HF_TOKEN is not set and sentence-transformers is not installed. "
                            "Set HF_TOKEN (Hugging Face Inference Providers) or pip install -r requirements-local.txt."
                        ) from e
                    self._model = SentenceTransformer(self.model_name, device="cpu")
        return self._model

    # ---- remote backend ---------------------------------------------------
    def _remote(self):
        if self._client is None:
            with self._lock:
                if self._client is None:
                    from huggingface_hub import InferenceClient

                    self._client = InferenceClient(provider="hf-inference", api_key=self.hf_token, timeout=self.timeout)
        return self._client

    @staticmethod
    def _to_sentence_vectors(raw, n: int) -> np.ndarray | None:
        arr = np.asarray(raw, dtype="float32")
        if arr.ndim == 3:  # token-level output -> mean pool
            arr = arr.mean(axis=1)
        if arr.ndim == 1 and n == 1:
            arr = arr[None, :]
        return arr if arr.ndim == 2 and arr.shape[0] == n else None

    def _encode_remote(self, texts: list[str]) -> np.ndarray:
        client = self._remote()
        out: list[np.ndarray] = []
        for i in range(0, len(texts), HF_BATCH_SIZE):
            batch = texts[i:i + HF_BATCH_SIZE]
            vecs = self._to_sentence_vectors(
                client.feature_extraction(batch, model=self.model_name, normalize=True), len(batch)
            )
            if vecs is None:  # provider did not return one vector per input: embed one by one
                vecs = np.vstack([
                    self._to_sentence_vectors(client.feature_extraction(t, model=self.model_name, normalize=True), 1)
                    for t in batch
                ])
            out.append(vecs)
        return np.vstack(out)

    # ---- public API -------------------------------------------------------
    @property
    def dimension(self) -> int:
        if self._dim is None:
            if self.uses_remote:
                self._dim = int(self._encode_remote(["dimension probe"]).shape[1])
            else:
                model = self._load()
                getter = getattr(model, "get_embedding_dimension", None) or model.get_sentence_embedding_dimension
                self._dim = int(getter())
        return self._dim

    def encode(self, texts: Sequence[str], batch_size: int = 32) -> np.ndarray:
        """Returns L2-normalised float32 vectors, so inner product == cosine similarity."""
        if not texts:
            return np.zeros((0, self.dimension), dtype="float32")
        if self.uses_remote:
            vecs = self._encode_remote(list(texts))
        else:
            vecs = self._load().encode(
                list(texts),
                batch_size=batch_size,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=False,
            )
        vecs = np.asarray(vecs, dtype="float32")
        norms = np.linalg.norm(vecs, axis=1, keepdims=True)
        vecs = vecs / np.clip(norms, 1e-12, None)
        return np.ascontiguousarray(vecs, dtype="float32")

    def encode_query(self, text: str) -> np.ndarray:
        return self.encode([text])

    def warmup(self) -> None:
        self.encode_query("warmup")
