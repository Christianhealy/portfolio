<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Working on this repo

Photo + film portfolio for Christian Healy. Design spec:
`docs/superpowers/specs/2026-10-07-portfolio-redesign-design.md`. Content workflow for the
owner: `HOW-TO-ADD-WORK.md`.

## Commands

Bun may not be on `PATH`; use this exact form (other forms may be blocked by permissions):

```sh
cd /Users/joshchan/Workspace/portfolio && export PATH="$HOME/.bun/bin:$PATH" && bun run <script>
```

| Script | What it does |
|---|---|
| `bun run test` | Vitest unit + component tests (jsdom) |
| `bun run test:e2e` | Playwright e2e + visual screenshots (desktop + phone) |
| `bun run check` | lint → typecheck → test → build → test:e2e. **Green `check` = done.** |
| `bun run dev` | dev server on http://localhost:8080 |

Work test-first: write the failing test, watch it fail, then the minimal code. Don't report a
task complete until `bun run check` passes.

## How the pieces fit

- **Content** lives in `src/content/` and is read only through `src/lib/content/index.ts`
  (`import.meta.glob` + vite-imagetools for AVIF/WebP/JPEG srcsets). Content must not go in
  `public/`: imagetools ignores it.
- **Build guard:** `contentPlugin` (`src/lib/content/vite-plugin.ts`) validates
  `src/content/` at build start and fails the build on errors (rules in `validate.ts`).
- **Fixtures:** tests never read real content. Vitest and the e2e build
  (`CONTENT_FIXTURES=1`) use `src/content/__fixtures__/valid`. In fixture mode, any relative
  import `./x` with a sibling `x.fixtures.ts` resolves to that twin; that's how the content
  source and Vimeo oEmbed fetch are swapped (`src/lib/*.fixtures.ts`). Regenerate fixture
  images with `bun scripts/generate-fixtures.mjs`.
- **E2E server:** Playwright builds with fixtures and serves `.output/` via `wrangler dev`
  (the same workerd runtime as production). `vite preview` cannot serve the nitro
  cloudflare-module output.
- **Visual baselines** are per platform (`e2e/visual.spec.ts-snapshots/*-darwin.png` locally,
  `*-linux.png` for CI). After an intentional visual change, regenerate macOS ones with
  `bun run test:e2e e2e/visual.spec.ts --update-snapshots=all` and Linux ones with
  `bash scripts/update-linux-snapshots.sh` (needs Docker; uses the same Playwright image as CI).
  Look at the images before committing. Plain `--update-snapshots` skips diffs that fall
  within tolerance. **Linux baselines have not been generated yet**, so CI visual tests fail
  until they are.
- **CI:** `.github/workflows/check.yml` runs `bun run check` on pull requests and pushes to
  `main`, inside `mcr.microsoft.com/playwright` (keep its tag in step with `@playwright/test`).
- **Motion:** every decision goes through `useMotionPrefs()`; reduced motion means
  ≤ 200 ms opacity fades only. Shared easing/durations are in
  `src/components/motion/tokens.ts` and mirrored as CSS variables in `src/styles.css`.

## Rules

- Never push to `main` directly or rewrite pushed history (see the Lovable note above).
  Work on a feature branch; `main` only receives green merges.
- `bunfig.toml` sets a 24 h `minimumReleaseAge`; brand-new package versions won't install.
  Don't add exclusions without asking.
- Don't run `bun run format` across the repo: it reformats Markdown and generated files.
  Run `bunx prettier --write <paths>` on the files you changed.
