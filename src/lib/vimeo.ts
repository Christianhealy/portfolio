import type { FilmEntry, ResponsiveImage } from "./content/types";

export interface VimeoRef {
  id: string;
  /** Private-link hash; unlisted videos only play (and resolve in oEmbed) with it. */
  hash?: string;
}

// Accepts anything a person might paste: a bare id, vimeo.com/<id>, vimeo.com/<id>/<hash>,
// player.vimeo.com/video/<id>?h=<hash>, or channel/group urls ending in an id.
export function parseVimeo(input: string): VimeoRef | null {
  const value = input.trim();
  if (/^\d+$/.test(value)) return { id: value };
  if (!/(^|\/\/|\.)vimeo\.com\//i.test(value)) return null;
  const [path = "", query = ""] = value.replace(/^[a-z]+:\/\//i, "").split(/[?#]/);
  const segments = path.split("/").slice(1);
  const playerIndex = segments.indexOf("video");
  // The id is the first numeric segment (after /video/ for player urls).
  const index =
    playerIndex >= 0
      ? /^\d+$/.test(segments[playerIndex + 1] ?? "")
        ? playerIndex + 1
        : -1
      : segments.findIndex((s) => /^\d+$/.test(s));
  const id = segments[index];
  if (index < 0 || !id) return null;
  const hash =
    /(?:^|&)h=([0-9a-z]+)/i.exec(query)?.[1] ?? segments[index + 1]?.match(/^[0-9a-z]+$/i)?.[0];
  return hash ? { id, hash } : { id };
}

export function parseVimeoId(input: string): string | null {
  return parseVimeo(input)?.id ?? null;
}

export function vimeoPlayerUrl({ id, hash }: VimeoRef): string {
  return `https://player.vimeo.com/video/${id}?${hash ? `h=${hash}&` : ""}dnt=1`;
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

  async function lookup(id: string, hash?: string): Promise<VimeoMeta | null> {
    const video = `https://vimeo.com/${id}${hash ? `/${hash}` : ""}`;
    const url = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(video)}&width=1280`;
    try {
      // `cf` is Cloudflare-only: it caches the response at the edge across all Worker
      // instances (ignored elsewhere). The in-memory cache below covers a single instance.
      const init = {
        signal: AbortSignal.timeout(4000),
        cf: { cacheTtl: SUCCESS_TTL / 1000, cacheEverything: true },
      };
      const response = await fetchFn(url, init as RequestInit);
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
    async get(id: string, hash?: string): Promise<VimeoMeta | null> {
      const key = `${id}/${hash ?? ""}`;
      const hit = cache.get(key);
      if (hit && hit.expires > now()) return hit.value;
      const value = await lookup(id, hash);
      cache.set(key, { value, expires: now() + (value ? SUCCESS_TTL : FAILURE_TTL) });
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

export function filmRefs(films: FilmEntry[]): VimeoRef[] {
  return films.map((f) => (f.vimeoHash ? { id: f.vimeoId, hash: f.vimeoHash } : { id: f.vimeoId }));
}

/** oEmbed metadata for the given films, keyed by Vimeo id (null when unavailable). */
export async function lookupFilmMeta(
  client: { get: (id: string, hash?: string) => Promise<VimeoMeta | null> },
  films: FilmEntry[],
): Promise<Record<string, VimeoMeta | null>> {
  const entries = await Promise.all(
    filmRefs(films).map(async ({ id, hash }) => [id, await client.get(id, hash)] as const),
  );
  return Object.fromEntries(entries);
}
