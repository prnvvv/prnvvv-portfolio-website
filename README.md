# prnvvv-portfolio-website

Personal developer portfolio highlighting AI/ML projects, open-source contributions, and technical expertise.

## Projects

### Ghost Protocol
An AI-powered RAG (Retrieval-Augmented Generation) system with a modern React frontend. Features document ingestion, semantic search, and intelligent chat with multi-model support.

- **Backend**: Python, LangChain, ChromaDB, Sentence Transformers, Groq
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Infrastructure**: CI/CD via GitHub Actions, deployment configs for Vercel & Railway

## Getting Started

```bash
# Backend (Python)
uv sync
uv run python main.py

# Frontend (within ghost-protocol)
cd ghost-protocol/frontend
npm install
npm run dev
```

Copy `.env.example` files to `.env` and fill in your API keys.

## License

MIT
