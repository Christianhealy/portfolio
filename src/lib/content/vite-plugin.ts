// Build guard for src/content (spec §4.4): lists the real folders with byte sizes, runs the
// pure validator, and fails the build with a readable message if anything is wrong.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { parseCaptions, parseFilm } from "./parse";
import { validateContent, type ContentListing, type ValidationResult } from "./validate";

/** vite-imagetools' default filter is lower-case only; cameras write `IMG_0001.JPG`. */
export const IMAGE_FILTER = /^[^?]+\.(jpe?g|png|webp)(\?.*)?$/i;

const FOLDERS = ["hero", "stills", "film", "about"] as const;

function listFolder(dir: string) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => statSync(join(dir, name)).isFile())
    .sort()
    .map((name) => ({ name, size: statSync(join(dir, name)).size }));
}

export function listContent(root: string): ContentListing {
  const listing: ContentListing = { hero: [], stills: [], film: [], about: [], captions: {} };
  for (const folder of FOLDERS) listing[folder] = listFolder(join(root, folder));
  const captions = join(root, "stills", "captions.txt");
  if (existsSync(captions)) listing.captions = parseCaptions(readFileSync(captions, "utf8"));
  return listing;
}

export function checkContent(root: string): ValidationResult {
  const listing = listContent(root);
  const result = validateContent(listing);
  for (const file of listing.film) {
    if (!file.name.endsWith(".md")) continue;
    try {
      parseFilm(file.name, readFileSync(join(root, "film", file.name), "utf8"));
    } catch (error) {
      result.errors.push(`film/${(error as Error).message}`);
    }
  }
  return result;
}

export interface ContentPluginOptions {
  /** Folder to validate. */
  root: string;
  /** Build the site from src/content/__fixtures__/valid instead of real content (e2e tests). */
  fixtures?: boolean;
}

export function contentPlugin({ root, fixtures = false }: ContentPluginOptions): Plugin {
  return {
    name: "portfolio-content",
    enforce: "pre",
    buildStart() {
      const { errors, warnings } = checkContent(root);
      for (const warning of warnings) this.warn(warning);
      if (errors.length) {
        this.error(`src/content has problems:\n  - ${errors.join("\n  - ")}`);
      }
    },
    resolveId(id, importer) {
      if (fixtures && id === "./source" && importer?.endsWith("/lib/content/index.ts")) {
        return importer.replace(/index\.ts$/, "source.fixtures.ts");
      }
      return null;
    },
  };
}
