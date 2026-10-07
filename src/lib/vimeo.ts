import type { FilmEntry, ResponsiveImage } from "./content/types";

// Accepts anything a person might paste: a bare id, vimeo.com/<id>, vimeo.com/<id>/<hash>,
// player.vimeo.com/video/<id>, or channel/group urls ending in an id.
export function parseVimeoId(input: string): string | null {
  const value = input.trim();
  if (/^\d+$/.test(value)) return value;
  if (!/(^|\/\/|\.)vimeo\.com\//i.test(value)) return null;
  const path = value.replace(/^[a-z]+:\/\//i, "").split(/[?#]/)[0] ?? "";
  const segments = path.split("/").slice(1);
  const playerIndex = segments.indexOf("video");
  if (playerIndex >= 0) return segments[playerIndex + 1]?.match(/^\d+$/)?.[0] ?? null;
  // The id is the first numeric segment; anything after it is a private-link hash.
  const numeric = segments.filter((s) => /^\d+$/.test(s));
  return numeric[0] ?? null;
}

export interface VimeoMeta {
  title?: string;
  thumbnail?: { src: string; width: number; height: number };
}

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

const SUCCESS_TTL = 6 * 60 * 60 * 1000;
const FAILURE_TTL = 5 * 60 * 1000;

// Title + thumbnail via Vimeo's public oEmbed endpoint (no API key). Cached per server
// instance; a failed lookup resolves to null so an unreachable Vimeo never breaks a page.
export function createOEmbedClient(fetchFn: Fetch, { now = Date.now } = {}) {
  const cache = new Map<string, { value: VimeoMeta | null; expires: number }>();

  async function lookup(id: string): Promise<VimeoMeta | null> {
    const url = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}&width=1280`;
    try {
      const response = await fetchFn(url, { signal: AbortSignal.timeout(4000) });
      if (!response.ok) return null;
      const data = (await response.json()) as Record<string, unknown>;
      const meta: VimeoMeta = {};
      if (typeof data["title"] === "string") meta.title = data["title"];
      const { thumbnail_url: src, thumbnail_width: width, thumbnail_height: height } = data;
      if (typeof src === "string" && typeof width === "number" && typeof height === "number") {
        meta.thumbnail = { src, width, height };
      }
      return meta;
    } catch {
      return null;
    }
  }

  return {
    async get(id: string): Promise<VimeoMeta | null> {
      const hit = cache.get(id);
      if (hit && hit.expires > now()) return hit.value;
      const value = await lookup(id);
      cache.set(id, { value, expires: now() + (value ? SUCCESS_TTL : FAILURE_TTL) });
      return value;
    },
  };
}

/** Front-matter title → Vimeo title → slug ("nike-spring" → "Nike Spring"). */
export function filmTitle(film: FilmEntry, meta: VimeoMeta | null): string {
  if (film.title) return film.title;
  if (meta?.title) return meta.title;
  return film.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export type FilmImage =
  | { kind: "poster"; image: ResponsiveImage }
  | { kind: "thumbnail"; src: string; width: number; height: number }
  | { kind: "card" };

/** Local poster override → Vimeo thumbnail → plain typographic card. */
export function filmImage(film: FilmEntry, meta: VimeoMeta | null): FilmImage {
  if (film.poster) return { kind: "poster", image: film.poster };
  if (meta?.thumbnail) return { kind: "thumbnail", ...meta.thumbnail };
  return { kind: "card" };
}
