// Runs against src/content/__fixtures__/valid: vitest.config.ts swaps ./source for
// ./source.fixtures via contentPlugin({ fixtures: true }).
import { describe, expect, it } from "vitest";
import { getAbout, getFilm, getFilms, getHero, getStills } from "./index";

describe("getHero", () => {
  it("returns the single hero image with intrinsic dimensions and responsive sources", () => {
    const hero = getHero();
    expect(hero).toMatchObject({ width: 1600, height: 1000 });
    expect(hero.src).toMatch(/^\/@imagetools\//);
    expect(hero.sources.map((s) => s.type)).toEqual(["image/avif", "image/webp", "image/jpeg"]);
    expect(hero.sources[0]!.srcset).toMatch(/ 640w/);
  });
});

describe("getStills", () => {
  it("lists stills in filename order, including upper-case extensions", () => {
    expect(getStills().map((s) => s.slug)).toEqual(["dunes", "portrait", "square", "harbour"]);
  });

  it("attaches captions and keeps each photo's real aspect ratio", () => {
    const portrait = getStills().find((s) => s.slug === "portrait")!;
    expect(portrait.caption).toBe("Lisbon, 2025");
    expect(portrait.filename).toBe("020-portrait.jpg");
    expect(portrait.image).toMatchObject({ width: 800, height: 1200 });
    expect(getStills()[0]!.caption).toBeUndefined();
  });
});

describe("getFilms / getFilm", () => {
  it("lists films in filename order with their poster override when present", () => {
    const films = getFilms();
    expect(films.map((f) => f.slug)).toEqual(["first-film", "second-film"]);
    expect(films[0]).toMatchObject({ title: "First Film", client: "Acme", vimeoId: "76979871" });
    expect(films[0]!.poster).toMatchObject({ width: 1600, height: 900 });
    expect(films[1]!.poster).toBeUndefined();
    expect(films[1]!.loop).toBeUndefined();
  });

  it("finds a film by slug, or undefined for an unknown slug", () => {
    expect(getFilm("second-film")?.vimeoId).toBe("22439234");
    expect(getFilm("nope")).toBeUndefined();
  });
});

describe("getAbout", () => {
  it("returns contact links, bio html and the portrait", () => {
    const about = getAbout();
    expect(about.email).toBe("hello@example.com");
    expect(about.bioHtml).toContain("<strong>bold</strong>");
    expect(about.portrait).toMatchObject({ width: 800, height: 1000 });
  });
});
