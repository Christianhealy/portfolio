import type { About, Film } from "./parse";

/** vite-imagetools `as=picture` output. */
export interface Picture {
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
}

/** Glob results keyed by path, exactly as `import.meta.glob` returns them. */
export interface ContentSource {
  hero: Record<string, Picture>;
  stills: Record<string, Picture>;
  captions: Record<string, string>;
  films: Record<string, string>;
  posters: Record<string, Picture>;
  loops: Record<string, string>;
  about: Record<string, string>;
  portrait: Record<string, Picture>;
}

export interface ResponsiveImage {
  /** Largest JPEG; also the `<img>` fallback. */
  src: string;
  width: number;
  height: number;
  /** Ordered best-first for `<picture>`: AVIF, WebP, JPEG. */
  sources: { type: string; srcset: string }[];
}

export interface Still {
  slug: string;
  filename: string;
  caption?: string;
  image: ResponsiveImage;
}

export interface FilmEntry extends Film {
  poster?: ResponsiveImage;
  /** URL of the optional silent loop. */
  loop?: string;
}

export interface AboutEntry extends About {
  portrait?: ResponsiveImage;
}
