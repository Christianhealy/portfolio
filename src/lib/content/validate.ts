// Guardrails for src/content (spec §4.4). Pure: takes a listing of names + byte sizes and
// returns human-readable problems. The Vite plugin in ./vite-plugin.ts feeds it the real
// folders and fails the build on errors.
import { slugFromFilename } from "./filenames";

export interface ContentFile {
  name: string;
  size: number;
}

export interface ContentListing {
  hero: ContentFile[];
  stills: ContentFile[];
  film: ContentFile[];
  about: ContentFile[];
  captions: Record<string, string>;
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

const MB = 1024 * 1024;
export const LIMITS = {
  imageError: 25 * MB,
  imageWarn: 10 * MB,
  loopError: 10 * MB,
  loopWarn: 8 * MB,
};

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const ALLOWED: Record<keyof Omit<ContentListing, "captions">, string[]> = {
  hero: IMAGE_EXTENSIONS,
  stills: [...IMAGE_EXTENSIONS, "txt"],
  film: [...IMAGE_EXTENSIONS, "md", "mp4"],
  about: [...IMAGE_EXTENSIONS, "md"],
};

const ext = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";
const base = (name: string) => name.replace(/\.[^.]+$/, "");
const mb = (bytes: number) => `${(bytes / MB).toFixed(1)} MB`;
export const isImage = (name: string) => IMAGE_EXTENSIONS.includes(ext(name));

export function validateContent(listing: ContentListing): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const folder of Object.keys(ALLOWED) as (keyof typeof ALLOWED)[]) {
    for (const file of listing[folder]) {
      if (file.name.startsWith(".")) continue;
      const path = `${folder}/${file.name}`;
      const e = ext(file.name);
      const raw = file.name.split(".").pop() ?? "";
      const slugged =
        (folder === "stills" && isImage(file.name)) || (folder === "film" && e === "md");
      if (!ALLOWED[folder].includes(e)) {
        errors.push(
          `${path}: .${e} files aren't supported here (use ${ALLOWED[folder].join(", ")}).`,
        );
      } else if (raw !== e && raw !== e.toUpperCase()) {
        // The content globs match .jpg or .JPG, never .Jpg.
        errors.push(`${path}: rename the ending to .${e} (mixed-case .${raw} isn't loaded).`);
      } else if (slugged && slugFromFilename(file.name) === "") {
        errors.push(
          `${path}: the name needs some plain letters or numbers (a–z, 0–9) for its web address.`,
        );
      } else if (isImage(file.name)) {
        if (file.size > LIMITS.imageError) {
          errors.push(
            `${path} is ${mb(file.size)}; the limit is 25 MB. Export a smaller JPEG (~4000px, quality 90).`,
          );
        } else if (file.size > LIMITS.imageWarn) {
          warnings.push(
            `${path} is ${mb(file.size)}; over 10 MB slows builds. ~4000px JPEG at quality 90 is plenty.`,
          );
        }
      } else if (e === "mp4") {
        if (file.size > LIMITS.loopError) {
          errors.push(
            `${path} is ${mb(file.size)}; loops must be under 10 MB (5–10 s, 1080p, no audio).`,
          );
        } else if (file.size > LIMITS.loopWarn) {
          warnings.push(`${path} is ${mb(file.size)}; aim for under 8 MB.`);
        }
      }
    }
  }

  const heroImages = listing.hero.filter((f) => isImage(f.name));
  if (heroImages.length !== 1) {
    errors.push(`hero/ must contain exactly one image (found ${heroImages.length}).`);
  }

  const stillImages = listing.stills.filter((f) => isImage(f.name));
  const filmFiles = listing.film.filter((f) => ext(f.name) === "md");
  for (const [label, files] of [
    ["stills", stillImages],
    ["film", filmFiles],
  ] as const) {
    const seen = new Map<string, string>();
    for (const file of files) {
      const slug = slugFromFilename(file.name);
      const other = seen.get(slug);
      if (other)
        errors.push(
          `${label}/${other} and ${label}/${file.name} both become "${slug}"; rename one.`,
        );
      else seen.set(slug, file.name);
    }
  }

  const filmBases = new Set(filmFiles.map((f) => base(f.name)));
  for (const file of listing.film) {
    if (ext(file.name) === "md" || file.name.startsWith(".")) continue;
    if (!filmBases.has(base(file.name))) {
      errors.push(
        `film/${file.name} has no matching film file (expected film/${base(file.name)}.md).`,
      );
    }
  }

  const stillNames = new Set(stillImages.map((f) => f.name));
  for (const file of Object.keys(listing.captions)) {
    if (!stillNames.has(file))
      warnings.push(`captions.txt mentions ${file}, which isn't in stills/.`);
  }

  return { errors, warnings };
}
