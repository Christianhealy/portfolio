// Fixture twin of ./source.ts, used by unit tests and e2e builds (CONTENT_FIXTURES=1).
// Each image query yields AVIF + WebP + JPEG at up to four widths (never upscaled or cropped).
import type { ContentSource, Picture } from "./types";

const source: ContentSource = {
  hero: import.meta.glob<Picture>(
    "/src/content/__fixtures__/valid/hero/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
    {
      eager: true,
      import: "default",
      query: { w: "640;1024;1600;2560", format: "avif;webp;jpg", quality: "80", as: "picture" },
    },
  ),
  stills: import.meta.glob<Picture>(
    "/src/content/__fixtures__/valid/stills/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
    {
      eager: true,
      import: "default",
      query: { w: "640;1024;1600;2560", format: "avif;webp;jpg", quality: "80", as: "picture" },
    },
  ),
  captions: import.meta.glob<string>("/src/content/__fixtures__/valid/stills/captions.txt", {
    eager: true,
    import: "default",
    query: "?raw",
  }),
  films: import.meta.glob<string>("/src/content/__fixtures__/valid/film/*.md", {
    eager: true,
    import: "default",
    query: "?raw",
  }),
  posters: import.meta.glob<Picture>(
    "/src/content/__fixtures__/valid/film/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
    {
      eager: true,
      import: "default",
      query: { w: "640;1024;1600;2560", format: "avif;webp;jpg", quality: "80", as: "picture" },
    },
  ),
  loops: import.meta.glob<string>("/src/content/__fixtures__/valid/film/*.{mp4,MP4}", {
    eager: true,
    import: "default",
    query: "?url",
  }),
  about: import.meta.glob<string>("/src/content/__fixtures__/valid/about/about.md", {
    eager: true,
    import: "default",
    query: "?raw",
  }),
  portrait: import.meta.glob<Picture>(
    "/src/content/__fixtures__/valid/about/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
    {
      eager: true,
      import: "default",
      query: { w: "640;1024;1600;2560", format: "avif;webp;jpg", quality: "80", as: "picture" },
    },
  ),
};

export default source;
