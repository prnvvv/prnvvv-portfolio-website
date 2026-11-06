"""Thin Groq SDK wrapper. Independent of retrieval; translates provider errors into safe app errors."""
from __future__ import annotations

import logging
from typing import Protocol

import groq

from app.core.exceptions import LLMError, LLMRateLimitError, LLMTimeoutError
from app.core.logging import log_event

logger = logging.getLogger(__name__)


class ChatLLM(Protocol):
    async def complete(self, messages: list[dict[str, str]]) -> str: ...


class GroqClient:
    def __init__(self, api_key: str, model: str, temperature: float, max_tokens: int,
                 timeout: float, max_retries: int = 1):
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self._client = groq.AsyncGroq(api_key=api_key, timeout=timeout, max_retries=max_retries)

    async def complete(self, messages: list[dict[str, str]]) -> str:
        try:
            resp = await self._client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                top_p=0.9,
            )
        except groq.APITimeoutError as e:
            log_event(logger, "groq timeout", level=logging.WARNING, error=type(e).__name__)
            raise LLMTimeoutError() from e
        except groq.RateLimitError as e:
            log_event(logger, "groq rate limited", level=logging.WARNING, error=type(e).__name__)
            raise LLMRateLimitError() from e
        except groq.APIStatusError as e:
            log_event(logger, "groq status error", level=logging.ERROR, status=e.status_code)
            raise LLMError(f"groq status {e.status_code}") from e
        except groq.APIConnectionError as e:
            log_event(logger, "groq connection error", level=logging.ERROR, error=type(e).__name__)
            raise LLMError("groq connection error") from e
        except Exception as e:  # never leak provider internals
            log_event(logger, "unexpected llm error", level=logging.ERROR, error=type(e).__name__)
            raise LLMError(type(e).__name__) from e

        choice = resp.choices[0] if resp.choices else None
        content = (choice.message.content if choice and choice.message else "") or ""
        return content.strip()

    async def aclose(self) -> None:
        await self._client.close()
