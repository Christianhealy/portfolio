// Regenerates the tiny solid-colour test images in src/content/__fixtures__/.
// Run: bun scripts/generate-fixtures.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const root = new URL("../src/content/__fixtures__/", import.meta.url).pathname;

async function image(rel, width, height, background, format = "jpeg") {
  const out = join(root, rel);
  mkdirSync(dirname(out), { recursive: true });
  await sharp({ create: { width, height, channels: 3, background } })
    [format]({ quality: 80 })
    .toFile(out);
}

const black = { r: 0, g: 0, b: 0 };

await image("valid/hero/hero.jpg", 1600, 1000, { r: 40, g: 40, b: 40 });
await image("valid/stills/010-dunes.jpg", 1200, 800, { r: 196, g: 160, b: 120 });
await image("valid/stills/020-portrait.jpg", 800, 1200, { r: 90, g: 110, b: 130 });
await image("valid/stills/030-square.PNG", 900, 900, { r: 150, g: 150, b: 150 }, "png");
await image("valid/stills/harbour.webp", 1200, 600, { r: 60, g: 90, b: 100 }, "webp");
await image("valid/film/010-first-film.jpg", 1600, 900, { r: 30, g: 30, b: 60 });
await image("valid/about/portrait.jpg", 800, 1000, { r: 120, g: 100, b: 90 });

await image("broken/hero/a.jpg", 10, 10, black);
await image("broken/hero/b.jpg", 10, 10, black);
await image("broken/stills/010-desert.jpg", 10, 10, black);
await image("broken/stills/020-desert.jpg", 10, 10, black);
