# Threat model

**Assets:** Groq API key, ADMIN_TOKEN, Groq quota/cost, site integrity. Owner contact details are public by design.

**Trust boundaries:** browser <-> backend; backend <-> Groq; data files -> vector index.

**Entry points:** `POST /api/chat`, `POST /api/admin/ingest` (disabled by default), the static site.

**Threat actors:** anonymous abuser or scraper, prompt-injection attacker, bot spamming the LLM to run up cost.

**Scenarios and mitigations**
- Prompt injection / system prompt leak: input guard, injection detector, intent classifier, context guard, output guard with secret redaction, history stored server-side only.
- Cost / DoS: per-IP and per-session limits, lockout, size and length caps, timeouts. Residual: no global budget (set a Groq spend cap).
- Rate-limit bypass via spoofed `X-Forwarded-For`: fixed (SEC-02).
- XSS via model output: markdown without raw HTML, safe link schemes.
- Supply chain: `npm audit` in CI; Python deps are unpinned (SEC-07).
- Clickjacking: `X-Frame-Options: DENY` plus meta CSP.
