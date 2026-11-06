from __future__ import annotations

import shutil
import sys
from pathlib import Path

import pytest

BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND))

from app.config import Settings  # noqa: E402
from app.dependencies import build_container  # noqa: E402

REAL_DATA = BACKEND / "data"


class FakeLLM:
    """Records every call; `fn(messages) -> str` decides the reply."""

    def __init__(self, fn=None):
        self.calls: list[list[dict]] = []
        self.fn = fn or self.grounded_reply

    @staticmethod
    def grounded_reply(messages) -> str:
        # replies with the first content line of the first context block - always grounded
        user = messages[-1]["content"]
        ctx = user.split("<portfolio_context>")[1].split("</portfolio_context>")[0]
        lines = [ln for ln in ctx.splitlines() if ln.strip() and not ln.startswith("[") and not ln.startswith("Subject")]
        return lines[0][:200] if lines else "NOT_IN_PORTFOLIO"

    async def complete(self, messages):
        self.calls.append(messages)
        return self.fn(messages)


def make_settings(tmp: Path, data_dir: Path, **kw) -> Settings:
    base = dict(
        _env_file=None,
        groq_api_key="test-key-not-real",
        allowed_origins=["http://localhost:3000"],
        data_dir=str(data_dir),
        chroma_persist_directory=str(tmp / "chroma"),
    )
    base.update(kw)
    return Settings(**base)


@pytest.fixture(scope="session")
def real_data(tmp_path_factory) -> Path:
    """Copy of the real knowledge base so tests never rewrite backend/data/metadata.json."""
    dst = tmp_path_factory.mktemp("data") / "data"
    shutil.copytree(REAL_DATA, dst)
    return dst


@pytest.fixture(scope="session")
def real_container(tmp_path_factory, real_data):
    tmp = tmp_path_factory.mktemp("index")
    settings = make_settings(tmp, real_data)
    return build_container(settings, llm=FakeLLM())


@pytest.fixture()
def fake_llm() -> FakeLLM:
    return FakeLLM()


@pytest.fixture()
def container(real_container, fake_llm):
    """Real index + fresh services and a fresh FakeLLM for every test."""
    from app.core.security import SlidingWindowLimiter
    from app.dependencies import Container
    from app.llm.response_generator import ResponseGenerator
    from app.rag.pipeline import RAGPipeline
    from app.services.chat_service import ChatService

    s = real_container.settings
    chat = ChatService(s, RAGPipeline(real_container.retriever, s), ResponseGenerator(fake_llm))
    return Container(
        settings=s, store=real_container.store,
        retriever=real_container.retriever, chat=chat, ingestion=real_container.ingestion,
        ip_limiter=SlidingWindowLimiter(1000), session_limiter=SlidingWindowLimiter(1000), llm=fake_llm,
    )
