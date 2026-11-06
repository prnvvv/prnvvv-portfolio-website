# Portfolio RAG Assistant (backend)

A domain-restricted Retrieval-Augmented Generation chatbot that answers questions **only** about
Prannavakhanth, using the portfolio's own content as its single source of truth.

* **FastAPI** API · **FAISS** vector search · local **Sentence-Transformers** embeddings · **Groq** LLM
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
   │ 3 retriever          query → embedding → FAISS (all vectors) → rerank     │
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
│   ├── rag/         document_loader  data_validator  chunker  embeddings  vector_store  retriever  reranker  pipeline
│   ├── guardrails/  input_guard  prompt_injection_detector  intent_classifier  context_guard  output_guard  system_policy
│   ├── llm/         groq_client  prompt_templates  response_generator
│   ├── schemas/     request.py  response.py
│   └── services/    chat_service.py  ingestion_service.py
├── scripts/         ingest.py  rebuild_index.py  validate_data.py  eval_retrieval.py  dev_stub_server.py
├── tests/           test_ingestion  test_retrieval  test_guardrails  test_chat  test_security
├── vector_store/    generated FAISS index + metadata (git-ignored)
└── .env.example  requirements.txt
```

Deviations from the original brief: `.env` holds no key until you add one; the FAISS sidecar is
`metadata.json` rather than `metadata.pkl` (no pickle deserialisation); `personal/languages.json`,
`education/coursework.json`, `experience/extracurriculars.json` and `research/*` extras were **not**
created where the portfolio has no such content (nothing is invented). See §4.

## 3. Technologies

Python 3.10-3.13 (FAISS/PyTorch wheels are not yet published for 3.14+) · FastAPI/Starlette · Pydantic Settings ·
`faiss-cpu` · `sentence-transformers` (`all-MiniLM-L6-v2`, 384-d, CPU) · official `groq` SDK · pytest.

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
3. `embeddings` encodes locally, L2-normalised (inner product = cosine).
4. `retriever` embeds the query, scores **every** vector (the corpus is tiny, so scores are exact), finds project names
   mentioned in the question (`SSL RUL` == `ssl-rul`), and `reranker` blends dense similarity + lexical title/text overlap +
   intent-category match + project-entity match.
5. `context_guard` keeps relevant chunks only (see §8) and builds a size-bounded context block.

Follow-up questions ("what technologies did it use?") borrow the previous *accepted* question for retrieval only.

## 6. FAISS indexing

`IndexIDMap2(IndexFlatIP)`; each vector id maps to a record `{chunk_id, text, metadata}` in `vector_store/metadata.json`
together with the embedding model name, dimension and a SHA-256 per source file. Saves are atomic (temp file + replace).
On load the index/metadata sizes and embedding model are cross-checked; a mismatch demands a rebuild instead of serving wrong answers.
The index is loaded once at startup; nothing is re-embedded unless a file changed.

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
("Does he know PyTorch?") are rescued by lexical overlap. Re-run the script after changing data or the embedding model.

## 9. Configuration (`backend/.env`)

```bash
cp .env.example .env      # then set GROQ_API_KEY
```

| Variable | Default | Notes |
|---|---|---|
| `GROQ_API_KEY` | - | **required**; never sent to the frontend or returned by any endpoint |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | any Groq chat model |
| `GROQ_TEMPERATURE` / `GROQ_MAX_TOKENS` / `GROQ_TIMEOUT_SECONDS` | 0.1 / 600 / 20 | |
| `EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | changing it requires `rebuild_index.py` |
| `FAISS_INDEX_PATH` / `FAISS_METADATA_PATH` | `vector_store/faiss.index` / `vector_store/metadata.json` | relative to `backend/` |
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
python scripts/rebuild_index.py     # full rebuild (also required after changing EMBEDDING_MODEL)
```

The server builds the index automatically on first start if none exists, and afterwards just loads it.
The first run downloads the embedding model (~90 MB) from Hugging Face; set `HF_HUB_OFFLINE=1` afterwards to skip network checks.

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
python -m pytest -q          # 172 tests, ~10 s once the embedding model is cached
python scripts/eval_retrieval.py
```

Covers ingestion/chunking/embeddings/FAISS persistence/incremental update/rebuild, retrieval quality, the full legitimate /
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
Commit data changes, then `python scripts/ingest.py` (or redeploy - the server indexes on first start). The FAISS index is a build
artefact; it is not committed.
