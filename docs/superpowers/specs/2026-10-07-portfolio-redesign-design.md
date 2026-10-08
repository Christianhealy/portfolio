# Portfolio Redesign — Design Spec

Date: 2026-10-07
Status: Approved; implemented on this branch (see §10 for decisions made during implementation)
Branch: `feat/portfolio-redesign`

## 1. Intent

A photo + film portfolio for Christian Healy. The owner is technical but does not
write code; adding work must be "drop a file in a folder" (at most, add a small
text file). The site should feel alive — a splash page, smooth scroll, subtle
parallax and reveals — without ever competing with the photographs. Agents
working on the repo must be able to verify their own work via automated tests.

**Inspiration:** frankyhanen.com/stills (uncropped masonry → fullscreen
lightbox slideshow), cardenkatz.com (sparse nav, film grid with moving
thumbnails, per-film pages with Vimeo + credits).

**Success criteria**

1. Adding a still = upload a correctly named image to `src/content/stills/`.
2. Adding a film = upload one small `.md` file containing a Vimeo link.
3. Thumbnails are accurate: never cropped, real aspect ratio, colour preserved.
4. Motion feels premium yet respects `prefers-reduced-motion`.
5. `bun run check` (lint, typecheck, unit, build, e2e) is the definition of done;
   `main` only receives green merges.

## 2. Current state (as of 2026-10-07)

- TanStack Start (React 19, Vite 8, Nitro → Cloudflare target via
  `@lovable.dev/vite-tanstack-config`), Tailwind v4, shadcn/ui, Bun
  (`bunfig.toml` has a 24 h `minimumReleaseAge`).
- Lovable-connected: all commits so far are Lovable bots; pushes to `main` sync
  to Lovable. Never rewrite pushed history (see `AGENTS.md`).
- Routes: `/` (white "Enter" splash), `/work` (masonry + category filters +
  lightbox fed by `public/portfolio.json`), `/about`, `/contact` (hardcoded).
- Existing: `PortfolioGallery`, `Lightbox`, `Reveal`, `SiteChrome`, `media.ts`.
- Gaps: no tests, Vimeo items have no thumbnails, stale `ateliernoir.studio`
  email in footer and contact page, all placeholder content.
- Aesthetic to keep as the base: black-on-white editorial, Instrument Serif
  display + Inter body, tiny tracked uppercase labels, square corners.

## 3. Hosting decision ladder

The image pipeline (§4.3) needs `sharp` (native module) at build time. Whether
Lovable's build supports it is unknown, so the **first task is a spike**:

1. **Spike / Plan A:** push a throwaway branch processing one image with
   `vite-imagetools`; confirm Lovable builds and serves it. Pass → stay on
   Lovable, Approach 1.
2. **Plan B:** if the spike fails, move hosting to Cloudflare (Workers/Pages with
   GitHub integration and per-branch preview URLs) **under the owner's
   account**, and cleanly disconnect Lovable (no dual-push to `main`). Requires
   the owner's sign-off and checking for a Lovable-managed custom domain first.
   Still Approach 1.
3. **Plan C:** if Plan B is blocked (accounts, domain, owner preference), stay on
   Lovable and use Approach 3: serve originals, measure dimensions at build time
   with a pure-JS Vite plugin (no `sharp`). Folder layout and naming rules are
   identical, so the owner's workflow does not change.

Nothing outside the image-variant generation in the content layer depends on
which plan wins.

## 4. Content model

### 4.1 Layout

```
src/content/
  hero/
    <one image>              # splash photo; exactly one required
  stills/
    010-desert.jpg           # ordered by filename
    020-portrait.jpg
    captions.txt             # optional: "020-portrait.jpg | Lisbon, 2025"
  film/
    010-nike-spring.md       # one file per film
    010-nike-spring.mp4      # optional silent loop (same base name)
    010-nike-spring.jpg      # optional poster override (same base name)
  about/
    about.md                 # bio + contact front-matter
    portrait.jpg
HOW-TO-ADD-WORK.md           # repo root; plain-English guide
```

### 4.2 Rules

- **Ordering (stills and films):** sort by filename. Files with a leading number
  (`^\d+-`) come first, ascending numerically; unnumbered files follow,
  alphabetically (case-insensitive). The guide recommends steps of 10 so new
  items can be slotted in (`015-`). No metadata (EXIF, dates) is used anywhere.
- **Slugs:** the filename without extension and without the numeric prefix
  (`010-nike-spring.md` → `/film/nike-spring`). Stills deep-link by the same
  slug: `/stills?photo=desert`.
- **Allowed image types:** `.jpg`, `.jpeg`, `.png`, `.webp`.
- **Film file** (`src/content/film/*.md`):

  ```md
  ---
  vimeo: https://vimeo.com/123456789   # required; URL or numeric ID
  client: Nike                          # optional
  title: Spring Campaign                # optional; falls back to Vimeo title
  year: 2025                            # optional
  ---
  Optional description paragraph(s).

  Director: Christian Healy
  DP: Jane Doe
  ```

  Body lines matching `Role: Name` (after the description, i.e. the trailing
  block of such lines) are parsed as credits; everything before is the
  description.
- **About file** (`src/content/about/about.md`): front-matter `email`,
  `instagram`, `vimeo` (all optional); Markdown body is the bio.
- **Captions:** `captions.txt`, one `filename | caption` per line; blank lines
  and lines starting with `#` ignored.

### 4.3 Image pipeline (Approach 1)

- Loaders use `import.meta.glob` over `src/content/**`.
- `vite-imagetools` (sharp) generates, per image: widths ~640/1024/1600/2560 in
  AVIF + WebP + JPEG, plus intrinsic width/height. Originals are never emitted to
  the client.
- Never crop; no re-grading; keep/convert colour to sRGB with the embedded
  profile respected so tones match the original. Quality tuned high (e.g. JPEG
  ~82, AVIF ~60–65) — verify visually against originals during implementation.
- Grid uses `srcset`/`sizes`; the lightbox uses the 2560 variant.

### 4.4 Guardrails

Enforced by the content loader (build fails with a readable message) and covered
by unit tests:

| Check | Result |
|---|---|
| Image > 25 MB (GitHub web-upload ceiling) | error |
| Image > 10 MB | warning |
| Loop `.mp4` > 10 MB | error; > 8 MB warning |
| Unsupported file type in a content folder (ignoring `.md`, `.txt`, `.mp4` where allowed) | error |
| `hero/` contains ≠ 1 image | error |
| Film file missing/invalid `vimeo` | error |
| Duplicate slugs (stills or films) | error |
| `captions.txt` references a missing file | warning |

Recommended export (in `HOW-TO-ADD-WORK.md`): stills JPEG q≈90, ~4000 px long
edge (typically 3–8 MB). Loops: H.264 MP4, 1920×1080 (or 1280 wide), 5–10 s,
no audio, < 8 MB, exported from the master (not a Vimeo download). HandBrake
"Vimeo YouTube HQ 1080p" preset with audio removed is an acceptable path.

### 4.5 Vimeo data

- `vimeo.ts` parses `vimeo.com/<id>`, `vimeo.com/<id>/<hash>`,
  `player.vimeo.com/video/<id>`, and bare IDs.
- A server-side loader fetches `https://vimeo.com/api/oembed.json?url=…` for
  title + thumbnail, cached in memory per instance (and via HTTP cache headers).
- Fallback order for tile imagery: local poster override → oEmbed thumbnail →
  plain typographic card. Fallback for title: front-matter → oEmbed → slug.
- Unreachable Vimeo never breaks a page.

### 4.6 Removals / migration

- Remove `public/portfolio.json`, `public/images/portfolio/` (migrate the three
  placeholder photos into `src/content/stills/` / `hero/` / `about/`),
  `PortfolioGallery`, category filters, `media.ts`, YouTube support.
- Remove `ateliernoir.studio` references; email comes from `about.md`.
- Remove shadcn components only if clearly unused.

## 5. Pages and components

### 5.1 Routes

| Route | Content |
|---|---|
| `/` | Splash: full-bleed hero image and a centred, hairline-framed "Enter" link → `/stills` (the name is a visually hidden `<h1>`; see §10). Always shown when visiting `/`. |
| `/stills` | Uncropped masonry (3 cols desktop / 2 tablet / 1–2 phone). Click opens lightbox; URL `?photo=<slug>`. |
| `/film` | 2-column grid of `FilmTile`s (poster/oEmbed thumb, upgraded to loop if present), caption: client + "Title". |
| `/film/$slug` | 16:9 Vimeo player, Info (client, title, year, description), Credits, prev/next film. 404 for unknown slug. |
| `/about` | Portrait + bio from `about.md`, contact block (email, Instagram, Vimeo). |
| `/work` → `/stills`, `/contact` → `/about` | Redirects for old links. |

### 5.2 Chrome

- Header: "Christian Healy" wordmark (→ `/stills`), nav **Stills · Film · About**.
  Hides on scroll down, returns on scroll up; backdrop blur once scrolled.
  Mobile: full-screen overlay menu.
- Footer: email + Instagram from `about.md`.
- Header/footer not shown on the splash.

### 5.3 Lightbox

Uncropped, fit-to-viewport image; prev/next buttons, ←/→, swipe, Esc; counter
`04 / 32`; caption if present; preloads neighbours; open/close animates from/to
the thumbnail (shared layout); focus trap; URL kept in sync; browser back closes
it.

### 5.4 Units

- `src/lib/content/`: pure functions (`sortByFilename`, `slugFromFilename`,
  `parseCaptions`, `parseFilm`, `parseAbout`, `validate*`) + a thin glob layer
  exposing `getHero()`, `getStills()`, `getFilms()`, `getFilm(slug)`,
  `getAbout()`.
- `src/lib/vimeo.ts`: parsing, oEmbed fetch/cache, fallbacks.
- UI (`src/components/portfolio/`): `Splash`, `MasonryGrid`, `Lightbox`,
  `FilmTile`, `VimeoPlayer`, `SiteHeader`, `SiteFooter`.
- Motion (`src/components/motion/`): `SmoothScroll`, `Reveal`, `Parallax`,
  `PageTransition`, `useMotionPrefs`.

## 6. Motion system

- Libraries: `motion` (Framer Motion) and `lenis`.
- Shared tokens: easing `cubic-bezier(0.16, 1, 0.3, 1)`; durations 400–900 ms.
- **Global:** Lenis on desktop fine-pointer devices only; native scroll on touch,
  inside the lightbox, and over Vimeo iframes.
- **Splash:** hero scales 1.06 → 1.0 on load; "Enter" fades in after it. On exit: slight
  zoom + crossfade.
- **Route changes:** ~400 ms crossfade; scroll to top on navigation; native
  restoration on back/forward.
- **Masonry:** tiles fade + rise ~24 px on first entry, staggered ~60 ms by
  column; images fade in from a blank placeholder once loaded.
- **Parallax:** ≤ ±6 % translate, only on splash hero, about portrait, film-page
  posters. Not on masonry tiles.
- **Headings:** line reveal on scroll-in.
- **Film tiles:** hover dims siblings to ~60 %, caption lifts; loops play only
  while in viewport.
- **Lightbox:** shared-layout zoom from thumbnail; horizontal slide between
  images; follows finger on swipe.
- **Header:** slide hide/show; blur fades in after leaving top.
- **Reduced motion:** a single `useMotionPrefs()` disables Lenis, parallax,
  zooms and slides; everything becomes ≤ 200 ms opacity fades; loops show poster
  only.
- **Performance:** animate only `transform`/`opacity`; intrinsic image
  dimensions → CLS ≈ 0; hero preloaded with `fetchpriority="high"`; code-split
  motion where practical.

## 7. Testing and workflow

### 7.1 Layers

| Layer | Tool | Covers |
|---|---|---|
| Unit | Vitest | ordering, slugs, captions, film/about parsing, Vimeo parsing, every guardrail, oEmbed fallback |
| Component | Vitest + Testing Library (jsdom) | Lightbox keys/Esc/focus/counter/URL; FilmTile poster vs loop + reduced motion; `useMotionPrefs` switches |
| E2E | Playwright vs the fixture build served by `wrangler dev` | splash → Enter → stills; lightbox open/nav/close/deep-link; film list → film page with Vimeo iframe; about renders; redirects; no console errors; CLS ≈ 0 on `/stills` |
| Visual | Playwright `toHaveScreenshot` | splash, stills, lightbox, film, about at desktop + phone widths, reduced motion forced |

- Tests use `src/content/__fixtures__/` (tiny generated images, two films,
  deliberately broken cases), never real content, so adding work can't break
  tests. The glob layer accepts a root so fixtures can be swapped in.
- Vimeo oEmbed is mocked in unit and e2e tests.
- A separate `vitest.config.ts` is used (the Lovable Vite wrapper is not
  assumed to be Vitest-compatible).

### 7.2 Commands (documented in `AGENTS.md`)

- `bun run test` — unit + component
- `bun run test:e2e` — Playwright
- `bun run check` — lint + typecheck + unit + build + e2e (definition of done)

Agents follow TDD (failing test first) and do not report a task complete until
`check` passes.

### 7.3 Branching and CI

- Work on feature branches; merge to `main` only when green. Never force-push or
  rewrite pushed history.
- Add a GitHub Action running `bun run check` on PRs and on pushes to `main`.
- Be mindful of `bunfig.toml`'s 24 h `minimumReleaseAge` when adding packages.

## 8. Out of scope

CMS, analytics, contact form, blog, YouTube, categories/filters, dark mode,
image metadata (EXIF/date) of any kind.

## 9. Open items for the owner (only if needed)

- Only if the spike fails: does the owner use the Lovable editor, and is a custom
  domain managed in Lovable? (Decides Plan B vs Plan C.)
- Real content: hero photo, stills, film list, bio, contact links.

## 10. Decisions made during implementation

- **Hosting:** the spike passed (sharp/vite-imagetools builds on Lovable), so Plan A stands.
- **E2E server:** `vite preview` can't serve the nitro `cloudflare-module` output, so
  Playwright serves the fixture build with `wrangler dev` (devDependency). It's the same
  workerd runtime as production.
- **Fixture swapping:** in fixture builds (`CONTENT_FIXTURES=1`, and always in Vitest), any
  relative import `./x` with a sibling `x.fixtures.ts` resolves to the twin. This swaps the
  content source and the oEmbed fetch.
- **Unlisted Vimeo links** keep their private hash (`vimeoHash`); the player (`?h=`) and
  oEmbed need it.
- **Route transitions** use the View Transitions API via TanStack Router; search-only
  changes (opening a photo) don't animate.
- **Visual baselines:** macOS baselines are committed. Linux baselines for CI are generated
  with `scripts/update-linux-snapshots.sh` (needs Docker) and are **still to do**. Until
  then the CI visual tests fail.
- **Splash without the name (design polish round):** the large serif name was removed at the
  owner's request so only the photograph and "Enter" remain. "Enter" sits dead centre in a
  hairline frame that fills white on hover, over a soft radial shade so it reads on any photo.
  The name stays as a visually hidden `<h1>` for screen readers and search engines.
- **Lightbox thumbnail during the zoom:** the grid thumbnail the photo zooms from/to is hidden
  from the open zoom until the close zoom has finished, so the photo never appears to land
  twice. With no zoom (thumbnail off screen, reduced motion) it is never hidden.
- **Lightbox sizing:** the full-size photo is sized from its intrinsic dimensions (container
  query units on the stage), not from the loaded file. Before, an image that hadn't loaded yet
  measured 0×0, so the first open on a cold cache slid without zooming.
- **Film tiles fade in** from the placeholder once loaded, like the stills (poster and Vimeo
  thumbnail alike).
- **Placeholder content:** Vimeo id 76979871 returns 404 from oEmbed (likely embed/privacy
  restricted), so its tile uses the typographic fallback. `about.md` uses
  `hello@example.com` until real details arrive.
