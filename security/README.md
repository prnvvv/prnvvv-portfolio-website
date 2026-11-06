# Security audit

Scope: `ghost-protocol/` (React + Vite frontend on Vercel; FastAPI + FAISS + Groq RAG chatbot backend). There is no database, authentication, file upload or Supabase. The audit was static review plus local tooling only; nothing was scanned live.

Tools run: `npm audit`, `pytest` (backend suite), `tsc -b` and `vite build`, a regex secret scan of the working tree and the 50 latest commits, and manual code review.

Tools NOT run (not installed locally): gitleaks, trufflehog, semgrep, bandit, pip-audit, ZAP, Trivy. See MANUAL_ACTION_ITEMS.md.

Rerun:

```
cd ghost-protocol/frontend && npm audit && npm run build
cd ../backend && python -m pytest -q
```

Files: SECURITY_AUDIT_REPORT, VULNERABILITY_REGISTER, REMEDIATION_REPORT, SECURITY_TEST_RESULTS, THREAT_MODEL, SECURITY_CHECKLIST, MANUAL_ACTION_ITEMS.

Note: the "70-point checklist" mentioned in the request was not supplied, so SECURITY_CHECKLIST.md is built from the categories in the audit brief instead.
