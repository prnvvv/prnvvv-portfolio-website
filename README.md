# prnvvv-portfolio-website

Personal developer portfolio built with React, TypeScript, and Vite featuring an interactive 3D globe, animated UI components, and a military/HUD-themed design system.

## Tech Stack

- **React 19** + TypeScript
- **Vite 6**
- **Tailwind CSS 4**
- **Framer Motion 12**
- **Three.js** / React Three Fiber
- **Zustand** (state management)
- **React Router DOM v7**

## Routes

| Path | Page |
|---|---|
| `/` | Landing page (terminal intro, globe, social links) |
| `/dashboard`, `/command-center` | Main dashboard with all sections below |
| `/projects`, `/missions/all` | Full mission (project) dossier |

## Dashboard Sections

Operator Dossier & Skill Inventory · Academy Records · Top Missions · Service Record (vertical terminal-log timeline) · Credentials Vault · Commendations · Leadership & Roles

Section data lives in `ghost-protocol/frontend/src/data/`.

## Project Structure

```
ghost-protocol/frontend/src/
  components/sections/   dashboard sections
  components/ui/         shared UI (floating dock, CmdBar title bar, tags, ...)
  components/effects/    background and animation effects
  pages/                 route-level pages
  data/                  portfolio content
  styles/                globals.css, military.css, mobile-fixes.css
```

## Design System

- Dark HUD theme with a single green accent (`#00e67a`).
- Terminal boxes share a command-prompt title bar (`CmdBar`) with `$ cat ...` labels.
- Typography follows the Missions page: Share Tech Mono (`--font-mono`), with sizes on a 10 / 12 / 14 / 16px scale. Shared tokens are the `--type-*` variables in `styles/globals.css`.
- Shared page layout (content width, top spacing, dock offset) is defined in `styles/mobile-fixes.css`.

## Setup

```bash
cd ghost-protocol/frontend
npm ci
npm run dev
```

## Build

```bash
cd ghost-protocol/frontend
npm run build
```

The production build enforces HTTPS, so test locally with `npm run dev` rather than `npm run preview` over plain HTTP.

## Deployment

[https://prnvvv.vercel.app](https://prnvvv.vercel.app)

## License

MIT — see `ghost-protocol/LICENSE`.
