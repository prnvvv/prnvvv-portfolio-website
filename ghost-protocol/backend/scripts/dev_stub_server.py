"""DEV / TEST ONLY: runs the real API (index, retrieval, all guardrails) with a stand-in LLM that
answers extractively from the retrieved context. Lets you exercise the frontend, or run
frontend/e2e/chatbot.e2e.mjs, without a Groq API key. Never use this in production.

Usage: python scripts/dev_stub_server.py        (listens on 127.0.0.1:8000)
"""
import _bootstrap  # noqa: F401
import uvicorn

from app.config import Settings
from app.core.logging import configure_logging
from app.dependencies import build_container
from app.main import create_app


class ExtractiveLLM:
    async def complete(self, messages):
        user = messages[-1]["content"]
        ctx = user.split("<portfolio_context>")[1].split("</portfolio_context>")[0]
        lines = [ln.strip() for ln in ctx.splitlines() if ln.strip() and not ln.startswith(("[", "Subject"))]
        bullets = "\n".join(f"- {ln[:140]}" for ln in lines[:4])
        return f"Here is what the portfolio says:\n\n{bullets}\n\n**Note:** this is a *stand-in* reply."


def main() -> None:
    settings = Settings(
        _env_file=None,
        groq_api_key="stub",
        allowed_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        rate_limit_per_minute=1000,
        session_rate_limit_per_minute=1000,
    )
    configure_logging(False)
    container = build_container(settings, llm=ExtractiveLLM())
    container.embedder.warmup()
    uvicorn.run(create_app(settings, container), host="127.0.0.1", port=8000, log_level="warning")


if __name__ == "__main__":
    main()
