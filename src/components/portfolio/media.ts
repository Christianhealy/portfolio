export type MediaType = "image" | "video";

export interface PortfolioItem {
  id: string;
  type: MediaType;
  title: string;
  mediaUrl: string;
  category: string;
  description?: string;
  credits?: string;
  thumbnailUrl?: string;
}

/** Accept public Vimeo links, player links, and unlisted links with a privacy hash. */
export function vimeoEmbedUrl(value: string, preview = false): string | null {
  try {
    const source = new URL(value);
    if (!["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(source.hostname)) return null;
    const match = source.pathname.match(/^\/(?:video\/)?(\d+)(?:\/([\w-]+))?\/?$/);
    if (!match) return null;
    const target = new URL(`https://player.vimeo.com/video/${match[1]}`);
    const hash = source.searchParams.get("h") ?? match[2];
    if (hash) target.searchParams.set("h", hash);
    target.searchParams.set("autoplay", "1");
    if (preview) {
      for (const key of ["muted", "loop", "playsinline"]) target.searchParams.set(key, "1");
      target.searchParams.set("controls", "0");
    }
    return target.toString();
  } catch {
    return null;
  }
}

/** Best-effort poster frame for an external video embed URL. */
export function videoThumbnail(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/maxresdefault.jpg`;
  return null;
}

export function embedUrl(url: string): string {
  const vimeo = vimeoEmbedUrl(url);
  if (vimeo) return vimeo;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}autoplay=1`;
}

export async function fetchPortfolio(): Promise<PortfolioItem[]> {
  const res = await fetch("/portfolio.json");
  if (!res.ok) throw new Error("Could not load portfolio.json");
  return (await res.json()) as PortfolioItem[];
}
