// Pure parsers for the plain-text content files. No filesystem access here — the glob layer
// (./index.ts) hands these functions raw strings so they stay trivially testable.
import { marked } from "marked";
import { parseVimeo } from "../vimeo";
import { slugFromFilename } from "./filenames";

export interface Credit {
  role: string;
  name: string;
}

export interface Film {
  slug: string;
  filename: string;
  vimeoId: string;
  vimeoHash?: string;
  client?: string;
  title?: string;
  year?: string;
  description: string;
  credits: Credit[];
}

export interface About {
  email?: string;
  instagram?: string;
  vimeo?: string;
  bioHtml: string;
}

export function parseFrontMatter(text: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!match) return { data: {}, body: text.trim() };
  const data: Record<string, string> = {};
  for (const line of (match[1] ?? "").split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon <= 0) continue;
    const key = line.slice(0, colon).trim();
    const value = line
      .slice(colon + 1)
      .replace(/\s+#.*$/, "")
      .trim();
    if (key && value) data[key] = value;
  }
  return { data, body: (match[2] ?? "").trim() };
}

const CREDIT_LINE = /^([^:\n]{1,40}):\s+(\S.*)$/;

function splitCredits(body: string): { description: string; credits: Credit[] } {
  const lines = body.split(/\r?\n/);
  let start = lines.length;
  while (start > 0 && CREDIT_LINE.test(lines[start - 1] ?? "")) start--;
  // Credits must be their own block: preceded by a blank line or the start of the body.
  if (start > 0 && (lines[start - 1] ?? "").trim() !== "") start = lines.length;
  const credits = lines.slice(start).map((line) => {
    const [, role = "", name = ""] = CREDIT_LINE.exec(line) ?? [];
    return { role: role.trim(), name: name.trim() };
  });
  return { description: lines.slice(0, start).join("\n").trim(), credits };
}

export function parseFilm(filename: string, text: string): Film {
  const { data, body } = parseFrontMatter(text);
  const raw = data["vimeo"];
  if (!raw) throw new Error(`${filename}: missing "vimeo:" line (paste the Vimeo link).`);
  const ref = parseVimeo(raw);
  if (!ref) throw new Error(`${filename}: "${raw}" doesn't look like a Vimeo link.`);
  const { description, credits } = splitCredits(body);
  const film: Film = {
    slug: slugFromFilename(filename),
    filename,
    vimeoId: ref.id,
    description,
    credits,
  };
  if (ref.hash) film.vimeoHash = ref.hash;
  if (data["client"]) film.client = data["client"];
  if (data["title"]) film.title = data["title"];
  if (data["year"]) film.year = data["year"];
  return film;
}

export function parseCaptions(text: string): Record<string, string> {
  const captions: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const bar = line.indexOf("|");
    if (bar < 0) continue;
    const file = line.slice(0, bar).trim();
    const caption = line.slice(bar + 1).trim();
    if (file && caption) captions[file] = caption;
  }
  return captions;
}

export function parseAbout(text: string): About {
  const { data, body } = parseFrontMatter(text);
  const about: About = { bioHtml: marked.parse(body, { async: false }) };
  if (data["email"]) about.email = data["email"];
  if (data["instagram"]) about.instagram = data["instagram"];
  if (data["vimeo"]) about.vimeo = data["vimeo"];
  return about;
}
