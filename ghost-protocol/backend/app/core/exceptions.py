"""Application exceptions. Messages here are safe to show to visitors."""
from __future__ import annotations


class AppError(Exception):
    status_code = 500
    public_message = "Something went wrong. Please try again later."

    def __init__(self, detail: str | None = None):
        super().__init__(detail or self.public_message)
        self.detail = detail  # internal only, never returned to clients


class RequestTooLargeError(AppError):
    status_code = 413
    public_message = "Request is too large."


class RateLimitedError(AppError):
    status_code = 429
    public_message = "Too many requests. Please slow down and try again shortly."

    def __init__(self, retry_after: int = 60, detail: str | None = None):
        super().__init__(detail)
        self.retry_after = retry_after


class UnauthorizedError(AppError):
    status_code = 401
    public_message = "Unauthorized."


class NotFoundError(AppError):
    status_code = 404
    public_message = "Not found."


class IndexNotReadyError(AppError):
    status_code = 503
    public_message = "The knowledge base is not available right now. Please try again later."


class LLMError(AppError):
    status_code = 502
    public_message = "The assistant is temporarily unavailable. Please try again in a moment."


class LLMRateLimitError(LLMError):
    status_code = 503
    public_message = "The assistant is busy right now. Please try again in a moment."


class LLMTimeoutError(LLMError):
    status_code = 504
    public_message = "The assistant took too long to respond. Please try again."


class DataValidationError(AppError):
    status_code = 500
    public_message = "Knowledge base validation failed."
