# Manual action items

1. **CSP (SEC-05):** once the backend URL is known, add it to `connect-src` in `ghost-protocol/frontend/index.html` and set `VITE_CHATBOT_API_URL` in Vercel (Project > Settings > Environment Variables).
2. **Backend production env:** `ALLOWED_ORIGINS=https://prnvvv-portfolio-website.vercel.app`, `ALLOW_LOCALHOST_ORIGINS=false`, `DEBUG=false`, `TRUST_PROXY_HEADERS=true` only behind a trusted proxy, `ADMIN_TOKEN` empty or 24+ random characters.
3. **Groq dashboard:** set a monthly spend/usage limit on the API key. Rotate the key if it was ever shared.
4. **Scanners:** `pip install pip-audit && pip-audit -r ghost-protocol/backend/requirements.txt`; also run `gitleaks detect` and `semgrep --config auto`.
5. **After deploy:** check headers at securityheaders.com and TLS at ssllabs.com.
6. **Optional:** replace the inline theme script and `'unsafe-inline'` with a CSP hash; enable GitHub Dependabot.
