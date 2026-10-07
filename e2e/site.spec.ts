// Runs against the fixture build (see playwright.config.ts): 4 stills (dunes, portrait,
// square, harbour), 2 films (first-film with poster + credits, second-film with a mocked
// oEmbed title), about.md with hello@example.com.
import { expect, test } from "./test";

test.describe("splash", () => {
  test("shows the name without site chrome and enters the stills page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Christian Healy" })).toBeVisible();
    await expect(page.getByRole("navigation")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
    await page.getByRole("link", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/stills$/);
  });
});

test.describe("stills", () => {
  test("lists every still in filename order", async ({ page }) => {
    await page.goto("/stills");
    const tiles = page.locator("main").getByRole("button", { name: /^Open / });
    await expect(tiles).toHaveCount(4);
    await expect(tiles.first()).toHaveAccessibleName("Open dunes");
  });

  test("lightbox opens, navigates with keys, syncs the URL and closes", async ({ page }) => {
    await page.goto("/stills");
    await page.getByRole("button", { name: "Open dunes" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\?photo=dunes$/);
    await expect(dialog.getByText("01 / 04")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\?photo=portrait$/);
    await expect(dialog.getByText("02 / 04")).toBeVisible();
    await expect(dialog.getByText("Lisbon, 2025")).toBeVisible();

    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\?photo=dunes$/);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/stills$/);
  });

  test("prev/next buttons wrap around", async ({ page, isMobile }) => {
    test.skip(isMobile, "phones step by swiping (covered in Lightbox.test.tsx)");
    await page.goto("/stills?photo=dunes");
    await page.getByRole("button", { name: "Previous photo" }).click();
    await expect(page).toHaveURL(/\?photo=harbour$/);
    await page.getByRole("button", { name: "Next photo" }).click();
    await expect(page).toHaveURL(/\?photo=dunes$/);
  });

  test("deep link opens the lightbox on that photo", async ({ page }) => {
    await page.goto("/stills?photo=square");
    await expect(page.getByRole("dialog").getByText("03 / 04")).toBeVisible();
  });

  test("browser back closes the lightbox", async ({ page }) => {
    await page.goto("/stills");
    await page.getByRole("button", { name: "Open Lisbon, 2025" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.goBack();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page).toHaveURL(/\/stills$/);
  });

  test("an unknown photo slug just shows the grid", async ({ page }) => {
    await page.goto("/stills?photo=nope");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("main").getByRole("button", { name: /^Open / })).toHaveCount(4);
  });

  test("layout does not shift while images load (CLS ≈ 0)", async ({ page }) => {
    await page.goto("/stills");
    await page.waitForLoadState("networkidle");
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & {
              value: number;
              hadRecentInput: boolean;
            })[]) {
              if (!entry.hadRecentInput) total += entry.value;
            }
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 500);
        }),
    );
    expect(cls).toBeLessThan(0.01);
  });
});

test.describe("film", () => {
  test("lists films with client and title, falling back to the Vimeo title", async ({ page }) => {
    await page.goto("/film");
    const links = page.getByRole("link", { name: /First Film|Mock Vimeo Title/ });
    await expect(links).toHaveCount(2);
    await expect(page.getByText("Acme")).toBeVisible();
    await expect(page.getByRole("link", { name: "Mock Vimeo Title", exact: true })).toBeVisible();
  });

  test("film page embeds Vimeo, shows info and credits, links to the next film", async ({
    page,
  }) => {
    await page.goto("/film");
    await page.getByRole("link", { name: /First Film/ }).click();
    await expect(page).toHaveURL(/\/film\/first-film$/);
    await expect(page.getByRole("heading", { name: "First Film", level: 1 })).toBeVisible();
    await expect(page.locator("iframe")).toHaveAttribute(
      "src",
      /player\.vimeo\.com\/video\/76979871/,
    );
    await expect(page.getByText("A short fixture film used by the tests.")).toBeVisible();
    await expect(page.getByText("Jane Doe")).toBeVisible();
    await page.getByRole("link", { name: /Next/ }).click();
    await expect(page).toHaveURL(/\/film\/second-film$/);
    await expect(page.getByRole("heading", { name: "Mock Vimeo Title", level: 1 })).toBeVisible();
  });

  test("unknown film slug is a 404", async ({ page, consoleErrors }) => {
    const response = await page.goto("/film/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/not found/i)).toBeVisible();
    // Chrome logs the document's own 404 status; that one is expected.
    const documentError = consoleErrors.findIndex((e) => /status of 404/.test(e));
    expect(documentError).toBeGreaterThanOrEqual(0);
    consoleErrors.splice(documentError, 1);
  });
});

test.describe("about", () => {
  test("renders bio, portrait and contact links from about.md", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText("Fixture bio with")).toBeVisible();
    await expect(page.locator("main strong")).toHaveText("bold");
    await expect(
      page.locator("main").getByRole("link", { name: "hello@example.com" }),
    ).toHaveAttribute("href", "mailto:hello@example.com");
    await expect(page.locator("main").getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://instagram.com/example",
    );
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: "hello@example.com" }),
    ).toBeVisible();
  });
});

test.describe("navigation", () => {
  test("old links redirect", async ({ page }) => {
    await page.goto("/work");
    await expect(page).toHaveURL(/\/stills$/);
    await page.goto("/contact");
    await expect(page).toHaveURL(/\/about$/);
  });

  test("header links reach every section", async ({ page, isMobile }) => {
    await page.goto("/stills");
    for (const [name, url] of [
      ["Film", /\/film$/],
      ["About", /\/about$/],
      ["Stills", /\/stills$/],
    ] as const) {
      if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
      await page.getByRole("navigation").getByRole("link", { name }).click();
      await expect(page).toHaveURL(url);
    }
  });
});
