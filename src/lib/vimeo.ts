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
