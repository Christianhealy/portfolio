// The only way the site reads src/content. Everything is resolved at build time, so these
// getters are synchronous and work identically on the server and in the browser.
import { compareFilenames, slugFromFilename } from "./filenames";
import { parseAbout, parseCaptions, parseFilm } from "./parse";
import source from "./source";
import type {
  AboutEntry,
  ContentSource,
  FilmEntry,
  Picture,
  ResponsiveImage,
  Still,
} from "./types";

export type { AboutEntry, FilmEntry, ResponsiveImage, Still } from "./types";

const MIME: Record<string, string> = { avif: "image/avif", webp: "image/webp", jpeg: "image/jpeg" };
const filename = (path: string) => path.slice(path.lastIndexOf("/") + 1);
const base = (name: string) => name.replace(/\.[^.]+$/, "");

function toImage(picture: Picture): ResponsiveImage {
  return {
    src: picture.img.src,
    width: picture.img.w,
    height: picture.img.h,
    sources: Object.keys(MIME)
      .filter((format) => picture.sources[format])
      .map((format) => ({ type: MIME[format]!, srcset: picture.sources[format]! })),
  };
}

/** Glob results as [filename, value] pairs, in site order. */
function sorted<T>(modules: Record<string, T>): [string, T][] {
  return Object.entries(modules)
    .map(([path, value]) => [filename(path), value] as [string, T])
    .sort(([a], [b]) => compareFilenames(a, b));
}

function byBaseName<T>(modules: Record<string, T>): Map<string, T> {
  return new Map(sorted(modules).map(([name, value]) => [base(name), value]));
}

export function createContent(src: ContentSource) {
  const captions = parseCaptions(Object.values(src.captions)[0] ?? "");

  const stills: Still[] = sorted(src.stills).map(([name, picture]) => {
    const still: Still = { slug: slugFromFilename(name), filename: name, image: toImage(picture) };
    if (captions[name]) still.caption = captions[name];
    return still;
  });

  const posters = byBaseName(src.posters);
  const loops = byBaseName(src.loops);
  const films: FilmEntry[] = sorted(src.films).map(([name, text]) => {
    const film: FilmEntry = parseFilm(name, text);
    const poster = posters.get(base(name));
    if (poster) film.poster = toImage(poster);
    const loop = loops.get(base(name));
    if (loop) film.loop = loop;
    return film;
  });

  const aboutText = Object.values(src.about)[0] ?? "";
  const portrait = sorted(src.portrait)[0]?.[1];
  const about: AboutEntry = parseAbout(aboutText);
  if (portrait) about.portrait = toImage(portrait);

  const hero = sorted(src.hero)[0]?.[1];

  return {
    getHero(): ResponsiveImage {
      // The build guard guarantees exactly one hero image.
      if (!hero) throw new Error("src/content/hero/ needs exactly one image.");
      return toImage(hero);
    },
    getStills: () => stills,
    getFilms: () => films,
    getFilm: (slug: string) => films.find((film) => film.slug === slug),
    getAbout: () => about,
  };
}

export const { getHero, getStills, getFilms, getFilm, getAbout } = createContent(source);
