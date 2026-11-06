# Remediation report

- SEC-01: ran `npm audit fix` in `ghost-protocol/frontend` (changed `package-lock.json` only). Advisories went from 10 to 2 (moderate). `tsc -b` and `vite build` pass.
- SEC-02: `ghost-protocol/backend/app/api/chat.py`: `client_ip` now uses the right-most `X-Forwarded-For` entry. Test added: `backend/tests/test_security.py::test_client_ip_uses_proxy_appended_entry_not_spoofable_one`.
- SEC-03: `ghost-protocol/.github/workflows/ci.yml`: added `permissions: contents: read`, Node 20, and an `npm audit --audit-level=high` step.
- SEC-04: removed `ghost-protocol/backend/=1.8`.
- Docs: added `security/`.
