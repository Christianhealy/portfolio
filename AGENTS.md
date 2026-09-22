# Working on this portfolio

The owner has little coding experience. Explain changes in plain language, including what changed, what was checked, and whether anything was published.

## Project direction

- This website is a starting point; its sample branding and content are replaceable.
- Development happens locally and in GitHub. Do not direct the owner back to the Lovable editor.
- Retain working build dependencies unless a migration is part of the requested task. The Lovable-named Vite configuration is still required by the current build.
- Keep the README accurate when commands, file locations, or deployment behavior change.

## Development

- Use Bun with the committed `bun.lock`; install with `bun install --frozen-lockfile`.
- Run `bun run check` for code changes and inspect relevant pages in the local preview.
- Use the existing TanStack file routes in `src/routes/`; do not add Next.js conventions.
- Do not hand-edit `src/routeTree.gen.ts` or commit generated build/dependency directories.
- Keep gallery entries in `public/portfolio.json` and local photos in `public/images/portfolio/`.

## GitHub and hosting

- Prefer focused branches and pull requests for review. Do not merge or deploy unless the task authorizes it.
- Preserve published history. Use revert commits instead of force pushes.
- The current build targets a Cloudflare Worker. Verify dashboard settings before changing deployment configuration; production branch and deployment commands are not documented in source.
- Never commit credentials or private files. Everything in `public/` is public.
