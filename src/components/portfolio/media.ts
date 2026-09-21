export type MediaType = "image" | "video";

export interface PortfolioItem {
  id: string;
  type: MediaType;
  title: string;
  mediaUrl: string;
  category: string;
}

/** Best-effort poster frame for an external video embed URL. */
export function videoThumbnail(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/maxresdefault.jpg`;
  return null;
}

export function embedUrl(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}autoplay=1`;
}

export async function fetchPortfolio(): Promise<PortfolioItem[]> {
  const res = await fetch("/portfolio.json");
  if (!res.ok) throw new Error("Could not load portfolio.json");
  return (await res.json()) as PortfolioItem[];
}
