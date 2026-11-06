# Development

## Prerequisites
Node 20+, Python 3.10–3.13 (3.12 recommended; pinned in `.python-version`).

## Frontend
```bash
cd ghost-protocol/frontend
npm ci
npm run dev          # http://localhost:3000
npm run typecheck    # tsc -b (strict, unused locals/params are errors)
npm run build        # typecheck + production build
npm audit            # CI fails on high severity
```
The production build redirects http→https, so test production output behind HTTPS or use `npm run dev`.

## Backend
```bash
cd ghost-protocol/backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                   # set GROQ_API_KEY and ALLOWED_ORIGINS
uvicorn app.main:app --port 8000
python -m pytest -q                                    # full suite, no network/LLM needed
python scripts/ingest.py                               # (re)index data/*.json into ChromaDB
python scripts/rebuild_index.py                        # drop and rebuild the collection
```
Without a Groq key, `python scripts/dev_stub_server.py` runs real retrieval with a canned LLM.
The first run downloads ChromaDB's ONNX embedding model (~80 MB) to `~/.cache/chroma`.

## Environment variables
- Backend: see `ghost-protocol/backend/.env.example` (never commit `.env`).
- Frontend: `ghost-protocol/frontend/.env.example`; `VITE_CHATBOT_API_URL` is the deployed backend URL (the widget is hidden in production when unset).

## Deployment
- Frontend: Vercel (`vercel.json`). Backend: Render, build `pip install -r requirements.txt && python scripts/ingest.py` (ingests at build time so the 512 MB runtime only opens the prebuilt ChromaDB), start
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, health check `/api/health`. Set `ALLOWED_ORIGINS` to the Vercel origin.
- Persist the vector store with a Render disk and `CHROMA_PERSIST_DIRECTORY`, or accept a rebuild on each restart.
