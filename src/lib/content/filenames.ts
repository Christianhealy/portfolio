// Ordering and naming rules shared by every content folder (see HOW-TO-ADD-WORK.md).
// "010-desert.jpg" → order 10, slug "desert". Unnumbered files sort after numbered ones.

const PREFIX = /^(\d+)-(.+)$/;

function stripExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(0, dot) : filename;
}

function parse(filename: string): { order: number | null; rest: string } {
  const base = stripExtension(filename);
  const match = PREFIX.exec(base);
  if (!match) return { order: null, rest: base };
  return { order: Number(match[1]), rest: match[2] ?? "" };
}

export function compareFilenames(a: string, b: string): number {
  const pa = parse(a);
  const pb = parse(b);
  if (pa.order !== null && pb.order !== null && pa.order !== pb.order) {
    return pa.order - pb.order;
  }
  if (pa.order !== null && pb.order === null) return -1;
  if (pa.order === null && pb.order !== null) return 1;
  return pa.rest.localeCompare(pb.rest, undefined, { sensitivity: "base" });
}

export function slugFromFilename(filename: string): string {
  return parse(filename)
    .rest.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
