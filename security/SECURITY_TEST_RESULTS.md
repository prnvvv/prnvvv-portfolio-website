# Test results (local, 2026-11-06)

| Command | Result |
|---|---|
| `npm audit` (before) | 10 vulns: 7 high, 3 moderate |
| `npm audit fix`, then `npm audit` | 2 moderate (accepted, SEC-06) |
| `npx tsc -b` | no errors |
| `npm run build` | built OK (chunk-size warning only, pre-existing) |
| `pytest -q` in backend (before changes) | 174 passed |
| `pytest -q` (after all changes, incl. new test) | 175 passed |
| Secret regex scan (tree + last 50 commits) | only detector patterns and test fixtures; no real secrets |

Not run: gitleaks, trufflehog, semgrep, bandit, pip-audit, ZAP, Trivy, SecurityHeaders, SSL Labs. No browser, responsive or live-header verification was done. Rate limiting was verified only through the existing unit tests.
