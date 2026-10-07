// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { fileURLToPath } from "node:url";
import { imagetools } from "vite-imagetools";
import { contentPlugin, IMAGE_FILTER } from "./src/lib/content/vite-plugin";

// CONTENT_FIXTURES=1 builds the site from the test fixtures (used by the Playwright suite).
const fixtures = process.env["CONTENT_FIXTURES"] === "1";
const contentRoot = fileURLToPath(
  new URL(fixtures ? "./src/content/__fixtures__/valid" : "./src/content", import.meta.url),
);

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      // Fails the build on broken content (oversized files, missing Vimeo links, ...).
      contentPlugin({ root: contentRoot, fixtures }),
      // Generates responsive image variants + intrinsic dimensions at build time (sharp).
      imagetools({ include: IMAGE_FILTER }),
    ],
  },
});
