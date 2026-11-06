"""Local sentence-transformers embeddings. The model is loaded once and reused."""
from __future__ import annotations

import threading
from typing import Sequence

import numpy as np


class Embedder:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self._model = None
        self._lock = threading.Lock()

    def _load(self):
        if self._model is None:
            with self._lock:
                if self._model is None:
                    from sentence_transformers import SentenceTransformer

                    self._model = SentenceTransformer(self.model_name, device="cpu")
        return self._model

    @property
    def dimension(self) -> int:
        model = self._load()
        getter = getattr(model, "get_embedding_dimension", None) or model.get_sentence_embedding_dimension
        return int(getter())

    def encode(self, texts: Sequence[str], batch_size: int = 32) -> np.ndarray:
        """Returns L2-normalised float32 vectors, so inner product == cosine similarity."""
        if not texts:
            return np.zeros((0, self.dimension), dtype="float32")
        vecs = self._load().encode(
            list(texts),
            batch_size=batch_size,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return np.ascontiguousarray(vecs, dtype="float32")

    def encode_query(self, text: str) -> np.ndarray:
        return self.encode([text])

    def warmup(self) -> None:
        self.encode_query("warmup")
