from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "GHOST PROTOCOL API"
    app_version: str = "1.0.0"
    debug: bool = True

    chroma_persist_dir: str = "chroma_db"
    chroma_collection_name: str = "portfolio_documents"

    groq_api_key: str = ""
    embedding_model: str = "all-MiniLM-L6-v2"
    llm_model_name: str = "llama-3.3-70b-versatile"
    use_llm: bool = False
    top_k: int = 5

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
