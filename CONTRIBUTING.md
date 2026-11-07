# Contributing

- Keep changes small and focused; preserve the existing visual design (Commander and Noir themes) and routes.
- Frontend: TypeScript strict; `npm run typecheck` and `npm run build` must pass. No unused imports/variables (enforced by `tsc`).
  Colours come from the CSS tokens in `src/styles`, not hard-coded values. Respect `prefers-reduced-motion`.
- Backend: keep route handlers thin; business logic belongs in `services/`, `rag/`, `guardrails/`. Add tests with every change
  and run `python -m pytest -q`. Never put secrets in code or `.env.example`.
- Only add a dependency if it is genuinely needed, and remove ones you stop using.
- Commit messages: `type(scope): summary` (feat, fix, refactor, docs, style, chore).
