# Security checklist

The original 70-point list was not provided; this covers the categories in the audit brief.
Legend: [x] passed, [ ] failed, [!] requires manual verification, [-] not applicable.

- [x] No hardcoded secrets in the tree or last 50 commits (regex scan only)
- [x] `.env` files gitignored; `.env.example` has no values
- [!] Full git-history scan with gitleaks / trufflehog
- [!] Frontend bundle contains no backend secrets (scan script exists; not run)
- [x] No unsafe HTML rendering on live pages (tweet-card is unused)
- [x] Chat output sanitised (no raw HTML, safe links)
- [x] External links use noopener noreferrer
- [x] Server-side input validation, size limits, timeouts
- [x] CORS explicit, no wildcard, no credentials
- [x] Admin endpoint disabled by default, constant-time token check
- [x] Docs/OpenAPI disabled outside debug
- [x] Error responses do not leak internals
- [x] Rate limiting present (unit-tested)
- [x] Rate limit not bypassable via spoofed X-Forwarded-For (fixed)
- [x] Prompt-injection guardrails present and tested
- [x] Backend only indexes designated public data
- [!] CSP allows the production backend origin (SEC-05)
- [!] HSTS / TLS / headers verified on the live site
- [ ] Frontend deps: 2 moderate advisories remain (accepted)
- [!] Python dependency CVE scan (pip-audit)
- [!] Groq spend limit configured
- [-] Authentication, sessions, JWT, MFA, RLS/Supabase, file uploads, WebSockets, XML, containers
