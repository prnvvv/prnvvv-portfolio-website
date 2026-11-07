<!-- README HEADER IMAGE — Add assets/readme/readme_header.<extension> here (note: the screenshots folder in this repo is currently spelled `assests/readme/`) -->

<div align="center">

# Prannavakhanth A. — Developer Portfolio

**A terminal-inspired, HUD-style portfolio with an interactive 3D globe, two switchable themes, and a RAG-powered AI assistant.**

[**Live Website →**](https://folio-website.vercel.app/)

![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-backend-009688?logo=fastapi&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-vector_store-FF6446)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

---

## Overview

This is the personal developer portfolio of **Prannavakhanth A.** (GitHub: [`prnvvv`](https://github.com/prnvvv)), an AI/ML engineer, software developer and researcher working on agentic AI, generative AI, RAG and computer vision.

The site presents that work through a "command center" interface: a terminal-style landing page with a dotted 3D globe, an operator dossier, mission (project) records, a service-record timeline, and an **AI assistant** that answers questions about the portfolio from its own knowledge base.

Two visual modes share the exact same pages and layout:

- **Commander** — the original green HUD palette (default).
- **Noir** — a monochrome black-and-grayscale variant.

## Website Preview

<table>
  <tr>
    <td width="50%"><img src="assests/readme/landing_page_commander.png" alt="Landing page in the Commander theme: name, role, terminal intro card, access button and a dotted green globe" width="100%"></td>
    <td width="50%"><img src="assests/readme/landing_page_noir.png" alt="Landing page in the Noir theme: the same layout rendered in black and grayscale" width="100%"></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Landing page — Commander</b></sub></td>
    <td align="center"><sub><b>Landing page — Noir</b></sub></td>
  </tr>
</table>

## About the Portfolio

The goal is for the site to show engineering ability through its implementation as well as its content. The design follows a few rules:

- **Terminal language throughout.** Panels use a command-prompt title bar (`$ cat ...`), monospaced type (Share Tech Mono) and HUD-style section headers.
- **One layout, two themes.** Themes are CSS custom properties switched via a `data-theme` attribute that is set before first paint, so there is no flash of the wrong theme. The choice is persisted in `localStorage`.
- **Motion with purpose.** Animated globe, decrypting text, flickering grid, dithered background and a TV-style theme transition, built with Framer Motion, Three.js and canvas effects.
- **Responsive.** Desktop uses a side dock for section navigation; on small screens a bottom dock takes over.
