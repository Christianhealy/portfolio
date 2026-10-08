# Portfolio handoff

Updated: 2026-09-24. Repository: Christianhealy/portfolio.
Current working branch: feature/scramble-hover. Review: PR #3.
This batch is intended for that branch; merging/deployment is a separate step.
Verify the actual remote branch and latest commit before starting a new session.

## Current design and behavior

- Christian Healy branding; white minimal layout. Keep hello@ateliernoir.studio
  unchanged until Christian supplies a replacement.
- Navigation: Stills, Motion, About, Contact. Letter-scramble hover/focus on nav
  and Enter. No divider under the header. Enter goes to Motion; /work redirects.
- Stills contains photos, Motion contains videos. No visible gallery headings or
  category filters. Centered responsive two-column galleries, one column on mobile.
- About photo is smaller (280px maximum), text vertically centered beside it.
- Three real Vimeo films with 1280px thumbnails. Muted preview on hover/focus;
  keep poster visible until Vimeo timeupdate. Reduced motion disables previews.
  Click opens player with title and optional description/credits below. Modal
  uses the website background. Only Non Plus Ultra currently has a description.

## Files and commands

- public/portfolio.json: gallery entries, Vimeo URLs, thumbnail URLs, text.
- public/images/portfolio/: local still images.
- src/routes/: pages; src/components/portfolio/: shared gallery, player, navigation.
- src/styles.css: shared colors/styles.
- Install: bun install --frozen-lockfile (requires Bun and Node).
- Preview: bun run dev --host 127.0.0.1 --port 5173.
- Check: bun x tsc --noEmit; bun run build; bun run lint.
- Existing lint failures include unrelated formatting and fast-refresh warnings.
  Do not reformat the entire repository to fix them during a small visual edit.
- Local hot reload has occasionally served stale code: restart the dev server and
  refresh before diagnosing a regression. No need to rerun build on every CSS tweak.

## Switching tools

1. Finish a small batch in the current tool, check it, update this file, commit and push.
2. Stop editing in that tool. Use the SAME repository and branch in the next tool.
3. Codex/Claude: fetch and fast-forward a clean checkout. Lovable: use the original
   connected project, choose this branch in Project settings → Git → GitHub, and
   confirm sync is current before prompting. Do not disconnect/reconnect the project.
4. Read AGENTS.md and this file, then perform the next specific task. Avoid copying
   the whole chat history or rebuilding the project from a prompt.
5. Review and merge the working branch into main only when ready to release.
   Cloudflare production branch/settings have not been verified in this session.

Paste into any tool:
"Use Christianhealy/portfolio on feature/scramble-hover. Sync the latest GitHub
version first without discarding work. Read AGENTS.md and HANDOFF.md. Make only
this change: [request]. Keep explanations brief. Check the affected behavior and
update HANDOFF.md before committing/pushing when I request it."

## Outstanding

- Supply final project descriptions/credits and replace placeholder stills/contact copy.
- Confirm the production branch and deployment in Cloudflare before releasing.
- Older PRs #1 (docs) and #2 (branding) may overlap this work; inspect before merging
  them so old instructions do not replace the current handoff or branding.
