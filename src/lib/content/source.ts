// Raw content modules for the live site. Glob patterns and queries must be literals, so the
// fixture twin (./source.fixtures.ts) repeats them; keep the two files in sync.
// Each image query yields AVIF + WebP + JPEG at up to four widths (never upscaled or cropped).
import type { ContentSource, Picture } from "./types";

const source: ContentSource = {
  hero: import.meta.glob<Picture>("/src/content/hero/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", {
    eager: true,
    import: "default",
    query: { w: "640;1024;1600;2560", format: "avif;webp;jpg", quality: "80", as: "picture" },
  }),
  stills: import.meta.glob<Picture>("/src/content/stills/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", {
    eager: true,
    import: "default",
    query: { w: "640;1024;1600;2560", format: "avif;webp;jpg", quality: "80", as: "picture" },
  }),
  captions: import.meta.glob<string>("/src/content/stills/captions.txt", {
    eager: true,
    import: "default",
    query: "?raw",
  }),
  films: import.meta.glob<string>("/src/content/film/*.{md,MD}", {
    eager: true,
    import: "default",
    query: "?raw",
  }),
  posters: import.meta.glob<Picture>("/src/content/film/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", {
    eager: true,
    import: "default",
    query: { w: "640;1024;1600;2560", format: "avif;webp;jpg", quality: "80", as: "picture" },
  }),
  loops: import.meta.glob<string>("/src/content/film/*.{mp4,MP4}", {
    eager: true,
    import: "default",
    query: "?url",
  }),
  about: import.meta.glob<string>("/src/content/about/about.md", {
    eager: true,
    import: "default",
    query: "?raw",
  }),
  portrait: import.meta.glob<Picture>(
    "/src/content/about/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
    {
      eager: true,
      import: "default",
      query: { w: "640;1024;1600;2560", format: "avif;webp;jpg", quality: "80", as: "picture" },
    },
  ),
};

export default source;
