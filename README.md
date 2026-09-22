# Portfolio website

A starting point for a personal photography and film website. The current design has a white background, simple navigation, and an image gallery. The name “Atelier Noir,” photos, films, and contact details are sample content you can replace.

Originally generated with Lovable. Ongoing editing happens locally and through GitHub; using the Lovable editor is not required.

## Run the website on your computer

Install [Node.js 22.12 or later](https://nodejs.org/) and [Bun](https://bun.sh/docs/installation), plus [Git](https://git-scm.com/downloads). Bun downloads the packages this project needs. Use Bun consistently because `bun.lock` records the tested package versions.

In a terminal:

```sh
git clone https://github.com/Christianhealy/portfolio.git
cd portfolio
bun install --frozen-lockfile
bun run dev --host 127.0.0.1 --port 5173
```

Open http://127.0.0.1:5173. Leave the terminal running while previewing; press Ctrl+C to stop. Saving a source file normally updates the preview automatically. This local preview does not publish changes to your live website.

For a copy you already downloaded, open its folder instead of cloning again.

## Where to make changes

| What you want to change                               | File or folder                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| Home page and its Enter button                        | `src/routes/index.tsx`                                                 |
| Work page heading                                     | `src/routes/_site.work.tsx`                                            |
| About page text and image                             | `src/routes/_site.about.tsx`                                           |
| Contact page text and email                           | `src/routes/_site.contact.tsx`                                         |
| Site name, navigation, footer email                   | `src/components/portfolio/SiteChrome.tsx`                              |
| Gallery titles, categories, images, videos, and order | `public/portfolio.json`                                                |
| Photo files                                           | `public/images/portfolio/`                                             |
| Colors, fonts, and animations                         | `src/styles.css`                                                       |
| Browser titles and search/social descriptions         | Each page's `head` section; shared metadata in `src/routes/__root.tsx` |
| Browser tab icon                                      | `public/favicon.ico`                                                   |

The email address appears in both the Contact page and shared footer. The site name also appears in page metadata, so search for the old value when replacing it.

### Add a photo

1. Put a web-sized JPEG, PNG, or WebP in `public/images/portfolio/`. Use a simple filename such as `city-evening.jpg`.
2. Add an object to the array in `public/portfolio.json`:

```json
{
  "id": "city-evening",
  "type": "image",
  "title": "City Evening",
  "mediaUrl": "/images/portfolio/city-evening.jpg",
  "category": "Street"
}
```

Use a unique `id`. Separate objects with commas, but do not put a comma after the last object. File names are case-sensitive on the deployed site. Public URLs start with `/images/`, not `/public/images/`.

Categories become filter buttons automatically. Reorder objects to change gallery order; the masonry layout flows down each column. The About page image is set separately in its page file. Anything in `public/` is publicly downloadable.

### Add a video

Use the same fields with `"type": "video"` and an **embed URL**:

- YouTube: `https://www.youtube.com/embed/VIDEO_ID`
- Vimeo: `https://player.vimeo.com/video/VIDEO_ID`

Ordinary watch/share links are not converted automatically. The video must allow embedding. YouTube gets an automatic thumbnail; Vimeo currently gets a title card. Click a gallery item to open the large viewer.

## How the project fits together

- **React** builds the visible interface; **TypeScript** checks code for common mistakes.
- **TanStack Start and Router** handle pages and server rendering. `_site.tsx` shares the header and footer across Work, About, and Contact. `__root.tsx` wraps the whole site.
- **Tailwind CSS** handles styling; **Vite** runs the local preview and builds the site.
- `src/components/portfolio/` holds the gallery, viewer, navigation, and reveal animations.
- `src/components/ui/` contains reusable template components. Most are not currently used by the portfolio.
- `src/server.ts`, `src/start.ts`, and `src/lib/` contain server/error-handling helpers.
- `package.json` lists commands and packages. `bun.lock` pins their versions; keep it committed.
- `src/routeTree.gen.ts` is generated automatically. Do not edit it manually.
- `node_modules/`, `.output/`, `.wrangler/`, and other generated folders are local working files, not content to upload to GitHub.

There is no database or sign-in system. The gallery reads a JSON file. Contact links open an email app; there is no form that sends messages. Fonts and videos use external services.

## Check changes before publishing

```sh
bun run check
```

This runs the code-style check, TypeScript check, and production build. A passing build means the site can be packaged; it does not prove every interaction works. Also check navigation, gallery filters, image/video viewers, and narrow and wide browser windows.

Individual commands:

| Command             | Purpose                                                             |
| ------------------- | ------------------------------------------------------------------- |
| `bun run dev`       | Start the editing preview                                           |
| `bun run lint`      | Report style/code issues without changing files                     |
| `bun run typecheck` | Check TypeScript without changing files                             |
| `bun run build`     | Generate the Cloudflare production build                            |
| `bun run preview`   | Preview the built output; may require additional Cloudflare tooling |
| `bun run format`    | Rewrite formatting; review the resulting changes before committing  |

There is currently no automated interaction test suite. Six existing Fast Refresh warnings in shared UI components are development warnings, not failed checks.

## Safest GitHub workflow

A **branch** is a separate line of work. A **commit** is a saved checkpoint. A **push** uploads checkpoints to GitHub. A **pull request** is the review screen before changes are merged into `main`.

Start with a clean working folder. If you have unsaved/uncommitted work, finish or set it aside before switching branches.

```sh
git switch main
git pull --ff-only origin main
git switch -c update-home-page
```

Choose a new branch name for each change. Edit, preview, and run `bun run check`. Then review what changed:

```sh
git status
git diff
```

Stage only the intended files. For example, if you changed the home page:

```sh
git add src/routes/index.tsx
git commit -m "Update home page"
git push -u origin update-home-page
```

Pushing requires your own GitHub sign-in. Open a pull request on GitHub from your branch into `main`, review its changed files and any Cloudflare preview, then merge when ready. A merge into Cloudflare's production branch may publish immediately. Use a normal merge commit to preserve history. To undo published work, make a revert commit instead of force-pushing or rewriting history.

## Cloudflare hosting

The current build uses Nitro's `cloudflare-module` target, producing a Cloudflare Worker plus static assets in `.output/`. It generates `.output/server/wrangler.json`. This is not simply a static Vite site with a `dist/` folder.

The live Cloudflare account settings are not stored in this repository. Before the first merge, verify in the dashboard:

1. Which repository and production branch Cloudflare watches.
2. The install, build, and deploy commands and runtime versions.
3. Whether non-production branches create preview deployments.

Do not change working deployment settings based on the old template's mention of Cloudflare Pages. [Workers branch builds](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/) and [build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) explain the available controls.

The project still uses `@lovable.dev/vite-tanstack-config` as a build dependency, plus error-reporting helpers. These do not require editing in Lovable. Replacing them would be a separate technical migration. If a Lovable/GitHub connection still exists, retiring its documentation does not disconnect that account integration.
