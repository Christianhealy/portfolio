import { test as base, expect } from "@playwright/test";

// Every test: Vimeo's player is stubbed (offline, deterministic) and the page must not log
// console errors or throw.
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route(/player\.vimeo\.com/, (route) =>
        route.fulfill({ contentType: "text/html", body: "<html><body>player</body></html>" }),
      );
      await use(errors);
      expect(errors, "console errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
