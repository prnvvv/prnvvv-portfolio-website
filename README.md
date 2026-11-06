# prnvvv-portfolio-website

Personal developer portfolio built with React, TypeScript, and Vite featuring an interactive 3D globe, animated UI components, and a military/HUD-themed design system.

## Tech Stack

- **React 19** + TypeScript
- **Vite 6**
- **Tailwind CSS 4**
- **Framer Motion 12**
- **Three.js** / React Three Fiber
- **Zustand** (state management)
- **React Router DOM v7**

## Routes

| Path | Page |
|---|---|
| `/` | Landing page (terminal intro, globe, social links) |
| `/dashboard`, `/command-center` | Main dashboard with all sections below |
| `/projects`, `/missions/all` | Full mission (project) dossier |

## Dashboard Sections

Operator Dossier & Skill Inventory · Academy Records · Top Missions · Service Record (vertical terminal-log timeline) · Credentials Vault · Commendations · Leadership & Roles

Section data lives in `ghost-protocol/frontend/src/data/`.

## Project Structure

```
ghost-protocol/frontend/src/
  components/sections/   dashboard sections
  components/ui/         shared UI (floating dock, CmdBar title bar, tags, ...)
  components/effects/    background and animation effects
  pages/                 route-level pages
  data/                  portfolio content
  styles/                globals.css, military.css, mobile-fixes.css
```

## AI Assistant (RAG chatbot)

A floating chat widget (bottom-right on every page) answers questions about the portfolio owner only. It is backed by
`ghost-protocol/backend/`: FastAPI + ChromaDB (built-in local embeddings) + Groq, with layered guardrails.
The knowledge base is `ghost-protocol/backend/data/*.json`; the widget takes its colours from the existing Commander / Noir
theme tokens. Full documentation: [`ghost-protocol/backend/README.md`](ghost-protocol/backend/README.md).

```bash
# 1. backend (Python 3.10-3.13)
cd ghost-protocol/backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scriptsctivate
pip install -r requirements.txt
cp .env.example .env                                   # set GROQ_API_KEY
python scripts/ingest.py                               # build the ChromaDB collection (also auto-built on first start)
uvicorn app.main:app --port 8000

# 2. frontend (dev uses http://127.0.0.1:8000 automatically)
cd ghost-protocol/frontend
npm ci && npm run dev
```

In production set `VITE_CHATBOT_API_URL` to the deployed backend URL when building the frontend (the widget stays hidden
without it) and add the site origin to the backend's `ALLOWED_ORIGINS`.

## Design System

- Dark HUD theme with a single green accent (`#00e67a`).
- Terminal boxes share a command-prompt title bar (`CmdBar`) with `$ cat ...` labels.
- Typography follows the Missions page: Share Tech Mono (`--font-mono`), with sizes on a 10 / 12 / 14 / 16px scale. Shared tokens are the `--type-*` variables in `styles/globals.css`.
- Shared page layout (content width, top spacing, dock offset) is defined in `styles/mobile-fixes.css`.

## Setup

```bash
cd ghost-protocol/frontend
npm ci
npm run dev
```

## Build

```bash
cd ghost-protocol/frontend
npm run build
```

The production build enforces HTTPS, so test locally with `npm run dev` rather than `npm run preview` over plain HTTP.

## Deployment

[https://prnvvv.vercel.app](https://prnvvv.vercel.app)

## License

MIT — see `ghost-protocol/LICENSE`.
