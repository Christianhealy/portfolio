// Visual regression (spec §7.1): fixture content, reduced motion forced (playwright.config.ts),
// desktop + phone projects. Update baselines deliberately with:
//   bun run test:e2e e2e/visual.spec.ts --update-snapshots=all
import type { Page } from "@playwright/test";
import { expect, test } from "./test";

async function settle(page: Page) {
  // Walk down the page so scroll-in reveals and lazy images fire, then return to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((img) =>
        img.complete || img.getClientRects().length === 0
          ? null
          : new Promise((resolve) => img.addEventListener("load", resolve, { once: true })),
      ),
    );
  });
}

const pages = [
  ["splash", "/"],
  ["stills", "/stills"],
  ["film", "/film"],
  ["film-detail", "/film/first-film"],
  ["about", "/about"],
] as const;

for (const [name, url] of pages) {
  test(`${name} looks right`, async ({ page }) => {
    await page.goto(url);
    await settle(page);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: name !== "splash" });
  });
}

test("lightbox looks right", async ({ page }) => {
  await page.goto("/stills?photo=portrait");
  await expect(page.getByRole("dialog")).toBeVisible();
  await settle(page);
  await expect(page).toHaveScreenshot("lightbox.png");
});
