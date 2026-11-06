"""Centralised, validated configuration. All values come from environment / backend/.env."""
from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class ConfigError(RuntimeError):
    """Raised at startup when required configuration is missing or invalid."""


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- LLM (Groq) ---
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"
    groq_temperature: float = Field(0.1, ge=0.0, le=1.0)
    groq_max_tokens: int = Field(1000, ge=64, le=4096)
    groq_timeout_seconds: float = Field(20.0, gt=0)
    groq_max_retries: int = Field(1, ge=0, le=5)

    # --- Embeddings / FAISS ---
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    faiss_index_path: str = "vector_store/faiss.index"
    faiss_metadata_path: str = "vector_store/metadata.json"
    data_dir: str = "data"

    # --- API ---
    api_host: str = "127.0.0.1"
    api_port: int = Field(8000, ge=1, le=65535)
    allowed_origins: Annotated[list[str], NoDecode] = Field(default_factory=list)
    # Dev convenience: also accept http://localhost:<any port> / http://127.0.0.1:<any port> (Vite may pick 3001, 5173 ...).
    allow_localhost_origins: bool = False
    debug: bool = False

    # --- Retrieval ---
    top_k: int = Field(5, ge=1, le=20)
    similarity_threshold: float = Field(0.25, ge=0.0, le=1.0)
    max_input_length: int = Field(1000, ge=10, le=10_000)
    max_context_length: int = Field(6000, ge=500, le=30_000)
    max_chunk_chars: int = Field(900, ge=200, le=4000)

    # --- Conversation / abuse prevention ---
    max_history_turns: int = Field(4, ge=0, le=12)
    session_ttl_seconds: int = Field(1800, ge=60)
    max_sessions: int = Field(2000, ge=10)
    rate_limit_per_minute: int = Field(20, ge=1)
    session_rate_limit_per_minute: int = Field(12, ge=1)
    adversarial_strike_limit: int = Field(3, ge=1)
    adversarial_lockout_seconds: int = Field(300, ge=10)
    max_request_bytes: int = Field(8192, ge=512)
    request_timeout_seconds: float = Field(30.0, gt=0)
    trust_proxy_headers: bool = False  # honour X-Forwarded-For for rate limiting (only behind a trusted proxy)

    # --- Admin (ingestion endpoint is disabled unless a strong token is set) ---
    admin_token: str = ""

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _split_origins(cls, v):
        if isinstance(v, str):
            return [o.strip().rstrip("/") for o in v.split(",") if o.strip()]
        return v

    @field_validator("groq_api_key", "groq_model", "admin_token", mode="before")
    @classmethod
    def _strip(cls, v):
        return v.strip() if isinstance(v, str) else v

    # ---- resolved paths -------------------------------------------------
    def _resolve(self, p: str) -> Path:
        path = Path(p)
        return path if path.is_absolute() else BACKEND_DIR / path

    @property
    def data_path(self) -> Path:
        return self._resolve(self.data_dir)

    @property
    def index_path(self) -> Path:
        return self._resolve(self.faiss_index_path)

    @property
    def metadata_path(self) -> Path:
        return self._resolve(self.faiss_metadata_path)

    @property
    def admin_enabled(self) -> bool:
        return len(self.admin_token) >= 24

    # ---- validation -----------------------------------------------------
    def validate_runtime(self) -> None:
        """Fail fast, with actionable messages, when the server cannot run safely."""
        problems: list[str] = []
        if not self.groq_api_key:
            problems.append("GROQ_API_KEY is not set (add it to backend/.env).")
        if not self.groq_model:
            problems.append("GROQ_MODEL is empty.")
        elif re.search(r"guard|safeguard|whisper|orpheus|tts|embed", self.groq_model, re.I):
            problems.append(
                f"GROQ_MODEL '{self.groq_model}' is not a chat model (safety/speech models reject chat requests with HTTP 400). "
                "Use a chat model such as openai/gpt-oss-120b."
            )
        if not self.allowed_origins:
            problems.append("ALLOWED_ORIGINS is empty (comma-separated list of portfolio origins).")
        if "*" in self.allowed_origins:
            problems.append("ALLOWED_ORIGINS must not contain '*'.")
        if self.admin_token and not self.admin_enabled:
            problems.append("ADMIN_TOKEN is set but shorter than 24 characters.")
        if problems:
            raise ConfigError("Invalid backend configuration:\n  - " + "\n  - ".join(problems))


@lru_cache
def get_settings() -> Settings:
    return Settings()
