# Security audit report

## Architecture
- Frontend: `ghost-protocol/frontend` (React 19, Vite 6, static, Vercel). CSP via `<meta>` in `index.html`; other headers in `vercel.json`. Theme is stored in localStorage only.
- Backend: `ghost-protocol/backend` (FastAPI). `POST /api/chat` (public, rate-limited), `POST /api/admin/ingest` (404 unless ADMIN_TOKEN >= 24 chars, constant-time compare), `GET /health`. Docs/OpenAPI are off unless DEBUG.
- Data: public portfolio JSON in `backend/data`, local FAISS index. LLM: Groq (key only in backend `.env`).
- Trust boundaries: browser -> backend (untrusted input); backend -> Groq (untrusted output); data files -> index (validated by `data_validator`).

## Findings
| ID | Severity | Finding | Status |
|---|---|---|---|
| SEC-01 | HIGH | Frontend deps: 7 high advisories (vite, react-router(-dom), postcss, nanoid, browserslist, source-map-js). Mostly dev/build-time; react-router is runtime. Confirmed by `npm audit`. | FIXED (non-breaking `npm audit fix`) |
| SEC-02 | MEDIUM | `client_ip` took the LEFT-most `X-Forwarded-For` entry when `TRUST_PROXY_HEADERS=true`. That value is client-controlled, so per-IP rate limits could be bypassed by spoofing. Confirmed by code and a new test. Only exploitable when that flag is on. | FIXED |
| SEC-03 | LOW | CI used Node 18 (EOL), had no `permissions:` block and no dependency audit. | FIXED |
| SEC-04 | LOW | Stray tracked file `backend/=1.8` (pip error output from a mistyped command, with local paths). | FIXED (removed) |
| SEC-05 | MEDIUM | CSP `connect-src 'self'` does not list the production chatbot backend, so the widget's fetch would be blocked once `VITE_CHATBOT_API_URL` is set. Also `frame-ancestors` is ignored in a meta CSP (X-Frame-Options header covers clickjacking). | REQUIRES MANUAL ACTION (backend URL unknown) |
| SEC-06 | LOW | 2 moderate advisories remain: `@tailwindcss/typography` -> postcss-selector-parser (build-time ReDoS; npm's "fix" is a downgrade to 0.5.4). | ACCEPTED RISK |
| SEC-07 | LOW | `requirements.txt` uses compatible ranges with no lockfile or hashes; pip-audit not run. | REQUIRES MANUAL VERIFICATION |
| SEC-08 | INFO | Rate limiting is in-memory per process; no global budget cap on Groq usage. | ACCEPTED RISK (set a Groq spend limit) |
| SEC-09 | INFO | `tweet-card.tsx` uses `dangerouslySetInnerHTML` on react-tweet entity text; the component is not used by any page. | ACCEPTED RISK (unused) |
| SEC-10 | INFO | CSP allows `'unsafe-inline'` scripts (needed for the inline theme bootstrap). A hash would remove this. | ACCEPTED RISK |

No CRITICAL findings.

## Reviewed and found sound
- No secrets in the tree or recent history (only detection regexes and test fixtures). `.env*` is ignored and `.env.example` has empty values. A bundle scan script exists (`e2e/scan-bundle.mjs`).
- Chat input: extra fields forbidden, length caps, session-id regex, body-size limit including chunked bodies, timeouts, server-side history, per-IP and per-session limits, adversarial lockout, output guard with secret redaction, errors never echo payloads.
- CORS: explicit origins, no credentials, `*` rejected at startup, localhost regex only when enabled.
- Chat markdown: `skipHtml`, images dropped, links limited to http(s)/mailto with `noopener noreferrer`.
- External links use `rel="noopener noreferrer"`.
