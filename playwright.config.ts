import { defineConfig, devices } from "@playwright/test";

// E2E runs against a production build of the *fixture* content (src/content/__fixtures__/valid)
// with Vimeo oEmbed mocked, so adding real work can never break these tests. The build is
// served by `wrangler dev` — the same Workers runtime (workerd) as the live site; `vite preview`
// can't serve the nitro cloudflare-module output.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"] ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command:
      "CONTENT_FIXTURES=1 bun run build && wrangler dev -c .output/server/wrangler.json --port 4173 --ip 127.0.0.1 --log-level warn",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
