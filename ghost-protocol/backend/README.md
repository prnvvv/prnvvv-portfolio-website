# Portfolio RAG Assistant (backend)

A domain-restricted Retrieval-Augmented Generation chatbot that answers questions **only** about
Prannavakhanth, using the portfolio's own content as its single source of truth.

* **FastAPI** API · **ChromaDB** vector search · ChromaDB's built-in local **ONNX MiniLM** embeddings · **Groq** LLM
* Knowledge lives in `data/**/*.json` - nothing personal is hard-coded in prompts or code
* Defence in depth: input guard → injection detector → intent classifier → context guard → output guard

> No LLM guardrail can be called jailbreak-proof. This project layers independent, mostly deterministic
> checks (below), fails safe, and ships adversarial tests - but treat it as risk reduction, not a guarantee.

---

## 1. Architecture

```
Visitor ──► POST /api/chat ──► rate limit (IP + session) ──► body-size / schema validation
                                        │
                              ChatService (services/chat_service.py)
   ┌────────────────────────────────────┴────────────────────────────────────┐
   │ 1 input_guard        length, control chars, floods, adversarial lock-out │
   │ 2 injection detector + intent classifier  (PROMPT_INJECTION / OUT_OF_SCOPE ... → canned refusal, NO LLM call)
   │ 3 retriever          query → ChromaDB (embeds query, all chunks) → rerank│
   │ 4 context_guard      relevance + sufficiency + drops instruction-like chunks
   │ 5 Groq LLM           system policy + fenced context + server-side history │
   │ 6 output_guard       leaks, identity breaks, unsafe markup, grounding     │
   │ 7 one stricter regeneration, else safe fallback                           │
   └─────────────────────────────────────────────────────────────────────────┘
                                        │
              { success, answer, sources[], session_id }
```

Anything rejected in steps 1-4 never reaches the LLM.

## 2. Folder structure

```
backend/
├── data/                      JSON knowledge base (single source of truth)
│   ├── personal/  education/  experience/  skills/  projects/(individual/)  research/  achievements/  portfolio/
│   └── metadata.json          generated: categories, counts, file hashes, last ingest
├── app/
│   ├── main.py  config.py  dependencies.py
│   ├── api/         chat.py  health.py  admin.py
│   ├── core/        security.py (rate limit, body limit, headers, admin auth)  exceptions.py  logging.py
│   ├── rag/         document_loader  data_validator  chunker  vector_store  retriever  reranker  pipeline
│   ├── guardrails/  input_guard  prompt_injection_detector  intent_classifier  context_guard  output_guard  system_policy
│   ├── llm/         groq_client  prompt_templates  response_generator
│   ├── schemas/     request.py  response.py
│   └── services/    chat_service.py  ingestion_service.py
├── scripts/         ingest.py  rebuild_index.py  migrate_faiss_to_chroma.py  validate_data.py  eval_retrieval.py  dev_stub_server.py
├── tests/           test_ingestion  test_retrieval  test_guardrails  test_chat  test_security
├── chroma_data/     generated ChromaDB storage (git-ignored; see §6 for Render)
├── vector_store/    legacy FAISS index, only read by the migration script (git-ignored)
└── .env.example  requirements.txt
```

Deviations from the original brief: `.env` holds no key until you add one; `personal/languages.json`,
`education/coursework.json`, `experience/extracurriculars.json` and `research/*` extras were **not**
created where the portfolio has no such content (nothing is invented). See §4.

## 3. Technologies

Python 3.10-3.13 (onnxruntime wheels are not yet published for 3.14+) · FastAPI/Starlette · Pydantic Settings ·
`chromadb==1.5.9` (default embedding function: ONNX `all-MiniLM-L6-v2`, 384-d, CPU via onnxruntime) · official `groq` SDK · pytest.
No PyTorch, FAISS, sentence-transformers, Hugging Face token or Gemini key is used or needed.

## 4. Data extraction and conventions

The JSON files were generated from the portfolio's real data modules (`frontend/src/data/*.ts`) by a one-off
script, then reviewed, so nothing was re-typed by hand. Content that is **not** public on the site, is
unverified, or contradicts other portfolio data was left out:

| Left out | Why |
|---|---|
| Phone number (`operatorData.ts`) | not displayed publicly on the site |
| `data/github.ts` repo list | placeholder URLs and hard-coded star counts |
| `achievements.ts` entry descriptions | contradict `awards.ts` / `projects.ts` (e.g. different project per hackathon) |
| Simplilearn certificate share links | tokenised links; Coursera/LinkedIn links kept, tracking params stripped |
| Placeholder GitHub URL for KRED | `github.com/yourusername/kred` |

**FitAI, RL Studio and Synq** are not on the site; they come from the owner's project guide (`CLAUDE.md`) and carry
only that one-line description (`source: owner-provided`). Confirm or remove them.

**Schema conventions** - every file is a JSON object with:

| Field | Meaning |
|---|---|
| `category` (required) | `personal_profile`, `contact`, `education`, `experience`, `skills`, `projects`, `research`, `achievements`, `portfolio_general`, `faq` |
| `subcategory` | e.g. `internships`, `patents` |
| `source` (required) | where the facts came from |
| a list of objects, each with an `id` | one retrieval document **per item** (default) |
| `document_mode: "single"` | keep the whole file as ONE document (good for "list all certifications") |
| other fields | rendered into text as `Label: value` lines; `null`/empty values are skipped |

Project files live one-per-project in `data/projects/individual/` so retrieval can target them.
`python scripts/validate_data.py` enforces the schema and rejects files that look like they contain secrets.

## 5. How RAG works here

1. `document_loader` renders each JSON document to text starting with `[Category] Title` + `Subject: ...`.
2. `chunker` splits documents (≤ `MAX_CHUNK_CHARS`, default 900) on paragraph → line → sentence boundaries, repeating the header on every chunk.
3. `ingestion_service` upserts the chunks into ChromaDB, which embeds them itself (nothing in this project computes or passes embeddings).
4. `retriever` asks ChromaDB for the closest chunks (`query_texts`, cosine; the corpus is tiny, so it requests every chunk and scores are exact), finds project names
   mentioned in the question (`SSL RUL` == `ssl-rul`), and `reranker` blends dense similarity + lexical title/text overlap +
   intent-category match + project-entity match.
5. `context_guard` keeps relevant chunks only (see §8) and builds a size-bounded context block.

Follow-up questions ("what technologies did it use?") borrow the previous *accepted* question for retrieval only.

## 6. ChromaDB storage

* **Why ChromaDB:** one embedded, persistent store for vectors + text + metadata, with embedding built in - no separate model
  code, no PyTorch, no sidecar files. Memory is ~130 MB with the collection loaded, so it fits Render's 512 MB instance.
* **Embeddings:** the collection is created *without* an `embedding_function`, so ChromaDB's default applies to both
  `upsert(documents=...)` and `query(query_texts=...)`: ONNX `all-MiniLM-L6-v2` (384-d) run locally by onnxruntime.
  No `HF_TOKEN` or `GEMINI_API_KEY` is required. The model file (~80 MB) is downloaded once by ChromaDB into
  `~/.cache/chroma/onnx_models` on first use. If a future ChromaDB release changes its default, `tests/test_ingestion.py::test_collection_uses_cosine_and_default_embedding`
  fails instead of silently switching models; `chromadb` is pinned.
* **Collection:** `CHROMA_COLLECTION_NAME` (default `portfolio_knowledge`), `hnsw:space=cosine`, similarity = `1 - distance`.
  Chunk ids are deterministic (`<doc_id>#<chunk_index>`), so re-ingesting is an idempotent upsert. Metadata (source file, category,
  title, `doc_id`, `chunk_index`, `chunk_total`, ...) plus the source file's SHA-256 live on each chunk; lists are stored as JSON strings.
* **Ingestion:** per source file: upsert in batches of 64, then delete that file's stale chunks (an embedding failure leaves the old
  chunks in place). Unchanged files are skipped by hash, deleted files are removed, `rebuild_index.py` drops and recreates the collection.
  Ingestions are serialised with a lock. The server loads the persisted collection at start and only ingests when it is empty.
* **Persistence / Render:** data is written to `CHROMA_PERSIST_DIRECTORY` (default `./chroma_data`, git-ignored). Render's default
  filesystem is **ephemeral**: on every deploy/restart the collection would be rebuilt (a few seconds for 74 chunks, but it needs the
  model download). Options: (a) accept the rebuild (the data is rebuilt from `data/*.json`, nothing is lost); (b) attach a Render
  persistent disk (paid plans) mounted at e.g. `/var/data` and set `CHROMA_PERSIST_DIRECTORY=/var/data/chroma`. The repo has no
  `render.yaml`, so this is configured in the Render dashboard. To avoid downloading the model at runtime, add to the build command:
  `python -c "from chromadb.utils.embedding_functions import DefaultEmbeddingFunction as D; D()(['x'])"`.

### Migrating from the old FAISS index

`python scripts/migrate_faiss_to_chroma.py` is safe to re-run. It does **not** copy FAISS vectors (different embedding pipeline); it
re-ingests the authoritative `data/*.json` into Chroma, then checks chunk counts/ids and metadata against the old
`vector_store/metadata.json`, runs retrieval probes, and reopens the store to prove persistence. Add `--remove-old` to delete the
old `vector_store/` files, only if every check passed. Fresh installs do not need it.

## 7. Groq integration

`llm/groq_client.py` wraps `AsyncGroq` (model/temperature/max tokens/timeout/retries from `.env`) and converts every provider
failure into a safe visitor-facing error (`502/503/504`) - raw provider messages are only logged as an error *type*.
The prompt contains: the system policy, bounded **server-side** history of previously accepted turns, and only the retrieved
chunks inside `<portfolio_context>` (declared to the model as untrusted data). The whole knowledge base is never sent.

## 8. Guardrails

| Layer | File | What it does |
|---|---|---|
| System policy | `system_policy.py` | fixed identity/rules; no personal facts; model must answer `NOT_IN_PORTFOLIO` when evidence is missing |
| Input | `input_guard.py` | length, control/bidi characters, character/token floods, malformed text, per-session strike counter and temporary lock-out |
| Injection / exfiltration | `prompt_injection_detector.py` | regex families (override, role change, prompt/KB/secret/other-user exfiltration, execution, delimiter forging, retrieval tampering) run over normalised views: leetspeak, spaced letters, homoglyphs/zero-width chars, base64/hex/rot13/reversed payloads |
| Intent | `intent_classifier.py` | all 13 intents, multi-label; requires a portfolio *anchor* (he/his/name, a known project, or a topic noun) - otherwise `OUT_OF_SCOPE`; hard out-of-scope topics (code, maths, weather, trivia, creative writing) are refused even if phrased as portfolio questions |
| Context | `context_guard.py` | similarity threshold (calibrated, see below), topic-aware relaxation, relative-score cut, drops chunks that look like instructions (retrieved text = evidence, never instructions) |
| Output | `output_guard.py` | blocks prompt/secret leaks, identity breaks, code/HTML/images; **grounding**: numbers, URLs, e-mails and technology-like names must appear in the retrieved context; capitalised names must appear in the context or the knowledge base; one stricter regeneration then safe fallback |
| Conversation | `chat_service.py` | every message is judged independently; client history is not accepted (schema forbids it); blocked text is never stored in history; adversarial strikes lock a session |

Fallback messages (exact wording from the brief) live in `system_policy.py`.

**Threshold calibration** - `python scripts/eval_retrieval.py` runs 20 labelled portfolio questions and 8 unrelated ones.
Current result: recall@5 = 20/20 (19/20 before intent-aware ranking), in-scope best similarity min 0.27 / mean 0.48,
unrelated max 0.44 (a general "what is machine learning?" - stopped by the classifier, not the threshold).
`SIMILARITY_THRESHOLD=0.25` sits below the in-scope minimum and above the other unrelated queries; short keyword questions
("Does he know PyTorch?") are rescued by lexical overlap. Re-run the script after changing data.

## 9. Configuration (`backend/.env`)

```bash
cp .env.example .env      # then set GROQ_API_KEY
```

| Variable | Default | Notes |
|---|---|---|
| `GROQ_API_KEY` | - | **required**; never sent to the frontend or returned by any endpoint |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | any Groq chat model |
| `GROQ_TEMPERATURE` / `GROQ_MAX_TOKENS` / `GROQ_TIMEOUT_SECONDS` | 0.1 / 1000 / 20 | |
| `VECTOR_DB` | `chroma` | only supported value |
| `CHROMA_PERSIST_DIRECTORY` | `./chroma_data` | relative to `backend/`; use a persistent-disk path on Render (§6) |
| `CHROMA_COLLECTION_NAME` | `portfolio_knowledge` | |
| `ALLOWED_ORIGINS` | - | **required**, comma-separated exact origins; `*` is refused |
| `ALLOW_LOCALHOST_ORIGINS` | false (true in `.env.example`) | dev only: also allow `http://localhost:<any port>` / `127.0.0.1`; fixes `OPTIONS /api/chat 400` when Vite runs on 3001/5173 |
| `API_HOST` / `API_PORT` | `127.0.0.1` / `8000` | |
| `TOP_K`, `SIMILARITY_THRESHOLD`, `MAX_INPUT_LENGTH`, `MAX_CONTEXT_LENGTH` | 5, 0.25, 1000, 6000 | |
| `RATE_LIMIT_PER_MINUTE`, `SESSION_RATE_LIMIT_PER_MINUTE` | 20, 12 | |
| `TRUST_PROXY_HEADERS` | false | enable only behind a trusted reverse proxy (uses `X-Forwarded-For`) |
| `ADMIN_TOKEN` | empty | empty disables `/api/admin/ingest`; otherwise ≥ 24 random characters |
| `DEBUG` | false | enables `/docs` |

Startup validates configuration and aborts with a readable list of problems.
The frontend needs only `VITE_CHATBOT_API_URL`; it never sees backend variables.

## 10. Install

```bash
cd ghost-protocol/backend
python3.10 -m venv .venv            # 3.10-3.13
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # add GROQ_API_KEY
```

## 11. Ingest / rebuild

```bash
python scripts/validate_data.py     # schema + secret scan
python scripts/ingest.py            # incremental: only new/changed/deleted files are (re)processed
python scripts/rebuild_index.py     # full rebuild (drops and recreates the collection)
```

The server ingests automatically on first start if the collection is empty, and afterwards reuses the persisted one.
The first embedding call makes ChromaDB download its ONNX model (~80 MB) into its own cache; no account or token is involved.

## 12. Run

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Without a Groq key you can still exercise everything except real generation: `python scripts/dev_stub_server.py`.

## 13. Connect the frontend

In `ghost-protocol/frontend/.env.local` set `VITE_CHATBOT_API_URL=http://127.0.0.1:8000` (dev falls back to this automatically),
add the frontend origin to `ALLOWED_ORIGINS`, and run `npm run dev`. In production the widget is hidden unless
`VITE_CHATBOT_API_URL` is set at build time; its origin is added to the page CSP `connect-src` by `vite.config.ts`.

## 14. API

`POST /api/chat`
```json
{ "message": "Explain FitAI", "session_id": "optional-8-to-64-chars [A-Za-z0-9_-]" }
→ { "success": true, "answer": "...", "sources": [{"category":"projects","document":"fitai.json","title":"FitAI"}], "session_id": "..." }
```
Refusals are normal `200` responses with the fallback text and empty `sources`. Errors: `{ "success": false, "error": "<safe message>" }`
with `413` (too large), `422` (invalid), `429` (+`Retry-After`), `502/503/504` (LLM problems), `500`.
Extra fields (e.g. a `history` array) are rejected.

`GET /api/health` → `{status, index_loaded, documents, llm_configured}` (no configuration values).

`POST /api/admin/ingest?full_rebuild=false` with header `X-Admin-Token` → `404` unless `ADMIN_TOKEN` is configured; constant-time
token check, own rate limit. Prefer the CLI scripts.

## 15. Tests

```bash
python -m pytest -q          # 184 tests, ~30 s once ChromaDB's model is cached
python scripts/eval_retrieval.py
```

Covers ingestion/chunking/ChromaDB persistence/restart/upsert/batching/filtering/failure handling/incremental update/rebuild, retrieval quality, the full legitimate /
out-of-scope / adversarial query matrix (including obfuscated payloads), output grounding, API behaviour with a fake LLM,
CORS, admin auth, rate limits, size limits, log redaction, session isolation and retrieval-poisoning.
Frontend browser tests: `frontend/e2e/chatbot.e2e.mjs`; bundle secret scan: `frontend/e2e/scan-bundle.mjs`.

## 16. Security notes

* Secrets only in `backend/.env` (git-ignored; `.env.example` committed). Never logged or returned; logs redact key patterns and store only message length + short hash, never message text.
* CORS restricted to `ALLOWED_ORIGINS`, no credentials; strict security headers on every response.
* Body-size cap enforced even for chunked uploads; per-IP and per-session sliding-window limits; bounded session store (TTL, max sessions, max turns).
* Errors are generic; internals and stack traces are never returned.
* Frontend renders model output as Markdown with raw HTML disabled, images dropped, links limited to `http(s)`/`mailto` with `noopener noreferrer`.
* Limits: in-memory rate limiting/sessions are per process (use Redis if you scale out); the classifier is rule-based and conservative, so unusual but legitimate phrasing may get the clarification/refusal reply; the output guard is lexical, not a fact-checker.

## 17. Deployment

Run `uvicorn` (or `gunicorn -k uvicorn.workers.UvicornWorker`, **one worker** while limits/sessions are in-memory) behind HTTPS
(Render, Railway, Fly.io, a VPS ...). Set the env vars on the host, `ALLOWED_ORIGINS=https://prnvvv-portfolio-website.vercel.app`,
`TRUST_PROXY_HEADERS=true` if behind a proxy, and `VITE_CHATBOT_API_URL=https://<backend>` in the frontend build (Vercel).
Commit data changes, then `python scripts/ingest.py` (or redeploy - the server indexes on first start). The ChromaDB directory is a build
artefact; it is not committed (see §6 for Render persistence).
