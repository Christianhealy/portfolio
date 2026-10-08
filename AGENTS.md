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

## Shared workflow

Read HANDOFF.md before editing. It is the shared project memory for Codex, Claude,
and Lovable. Update it when handing work to another tool; keep it short.

- One tool edits at a time. Verify repository, branch, remote head, and working-tree
  status before changes. Fetch and fast-forward a clean checkout before starting.
  Preserve uncommitted work and resolve divergence without force pushing.
- Make only the requested changes. Read relevant files, avoid repeat full-repo
  reviews, keep replies concise, and batch related edits to conserve tokens.
- Use Bun and bun.lock. Do not introduce another package manager lockfile.
- Keep React/TanStack Start, Tailwind, and the existing Cloudflare build setup.
  Do not remove Lovable build dependencies just because another tool is editing.
- Preview locally, run TypeScript and a production build before publishing a batch.
  Test changed interactions in the browser. Report pre-existing failures separately.
- Commit/push when requested. A push to a working branch is not a production release.
  Merge to the production branch only when requested; verify Cloudflare deployment.
- Never commit secrets, node_modules, or generated build output. Do not hand-edit
  src/routeTree.gen.ts; let the route tooling regenerate it.
