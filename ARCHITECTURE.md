# Architecture

Monorepo with one app in `ghost-protocol/`: a static React portfolio and a FastAPI RAG chatbot backend.

```
Browser (Vercel, static)  ──POST /api/chat──►  FastAPI (Render)  ──►  ChromaDB (embedded)  ──►  Groq LLM
```

## Frontend (`ghost-protocol/frontend`)

React 19 + Vite 6 + TypeScript (strict, `noUnusedLocals/Parameters` on) + Tailwind 4. Client-side routing with
`react-router-dom`; every page is lazy-loaded (`src/router/index.tsx`).

| Path | Responsibility |
|---|---|
| `src/main.tsx`, `src/App.tsx` | Entry, error boundary, router, lazily mounted chatbot widget |
| `src/router/` | Routes: `/`, `/dashboard` (= `/command-center`), `/projects` (= `/missions/all`) |
| `src/pages/` | Page-level components (`landing`, `dashboard`, `ProjectsPage`) |
| `src/components/sections/` | Dashboard sections (dossier, service record, education, leadership, ...) |
| `src/components/chatbot/` | Chat widget (UI, `useChatbot` hook, error boundary, styles) |
| `src/components/{ui,layout,effects,Globe,HeroText,landing,social}` | Reusable UI and visual effects |
| `src/services/` | `dataService` (portfolio data selectors), `chatbotApi` (backend client) |
| `src/data/` | Static portfolio content |
| `src/store/` | Zustand stores (`themeStore`: Commander/Noir, `uiStore`) |
| `src/hooks/`, `src/lib/`, `src/utils/`, `src/types/` | Hooks, helpers, constants, shared types |
| `src/styles/` | Design tokens and global styles (`globals.css`, `military.css`, `mobile-fixes.css`) |

Themes are CSS custom properties switched via `data-theme` (set before first paint in `index.html`).
Security headers live in `vercel.json`; the CSP is a `<meta>` in `index.html` and `vite.config.ts` adds the chatbot
backend origin to `connect-src` from `VITE_CHATBOT_API_URL`.

## Backend (`ghost-protocol/backend`)

| Layer | Modules |
|---|---|
| API | `app/api/{chat,health,admin}.py` — thin handlers only |
| Orchestration | `app/services/chat_service.py` (guardrails → retrieve → generate → validate), `ingestion_service.py` |
| Guardrails | `app/guardrails/*` (input, injection, intent, context, output, policy) |
| RAG | `app/rag/{document_loader,data_validator,chunker,vector_store,retriever,reranker,pipeline}.py` |
| LLM | `app/llm/*` (Groq client, prompts, response generation) |
| Cross-cutting | `app/config.py`, `app/dependencies.py`, `app/core/{security,exceptions,logging}.py` |

Data flow: `data/**/*.json` → loader/validator → chunker → `VectorStore.replace_file` (ChromaDB embeds with its built-in
default, ONNX MiniLM) → `Retriever` (`query_texts`, cosine) → reranker → context guard → Groq. Startup initialisation
(model download + first ingestion) runs in the background so the port opens immediately; `/api/health` reports
`starting` → `ok`. See `ghost-protocol/backend/README.md` for details.
