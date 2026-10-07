# Christian Healy — Portfolio

Photo and film portfolio: a splash page, a Stills masonry grid with a fullscreen lightbox, a
Film grid with per-film Vimeo pages, and an About page. Black-on-white editorial design
(Instrument Serif + Inter) with subtle motion that respects reduced-motion settings.

- **Adding work** (photos, films, bio): see [HOW-TO-ADD-WORK.md](HOW-TO-ADD-WORK.md). It's
  all files in `src/content/`, no code.
- **Working on the code** (commands, tests, conventions): see [AGENTS.md](AGENTS.md).
- **Design spec:** [docs/superpowers/specs/2026-10-07-portfolio-redesign-design.md](docs/superpowers/specs/2026-10-07-portfolio-redesign-design.md).

## Stack

TanStack Start (React 19, Vite), Tailwind v4, vite-imagetools (responsive AVIF/WebP/JPEG at
build time), motion + Lenis, Vitest + Testing Library, Playwright. Built with Bun and deployed
as a Cloudflare Worker by Lovable.

## Local development

Requires [Bun](https://bun.sh).

```sh
bun install
bun run dev      # http://localhost:8080
bun run check    # lint, typecheck, unit tests, build, e2e + visual tests
```

## Lovable

This repository is connected to the
[Lovable editor](https://lovable.dev/projects/085b2e97-2e52-4f8e-80f2-8863a35a115e). Commits
to `main` sync into Lovable. The live site only updates when someone clicks **Publish** in
Lovable. Never force-push or rewrite pushed history (see `AGENTS.md`).
