import { describe, expect, it } from "vitest";
import { parseAbout, parseCaptions, parseFilm, parseFrontMatter } from "./parse";

describe("parseFrontMatter", () => {
  it("reads simple key: value pairs and returns the body", () => {
    const { data, body } = parseFrontMatter("---\ntitle: Spring\nyear: 2025\n---\nHello\n");
    expect(data).toEqual({ title: "Spring", year: "2025" });
    expect(body).toBe("Hello");
  });

  it("keeps colons inside values (urls) and strips trailing comments", () => {
    const { data } = parseFrontMatter("---\nvimeo: https://vimeo.com/1   # required\n---\n");
    expect(data["vimeo"]).toBe("https://vimeo.com/1");
  });

  it("treats a file without front-matter as all body", () => {
    expect(parseFrontMatter("Just text")).toEqual({ data: {}, body: "Just text" });
  });
});

describe("parseFilm", () => {
  const file = [
    "---",
    "vimeo: https://vimeo.com/123456789",
    "client: Nike",
    "title: Spring Campaign",
    "year: 2025",
    "---",
    "A short film about running.",
    "",
    "Second paragraph.",
    "",
    "Director: Christian Healy",
    "DP: Jane Doe",
    "",
  ].join("\n");

  it("parses metadata, description and credits", () => {
    expect(parseFilm("010-nike-spring.md", file)).toEqual({
      slug: "nike-spring",
      filename: "010-nike-spring.md",
      vimeoId: "123456789",
      client: "Nike",
      title: "Spring Campaign",
      year: "2025",
      description: "A short film about running.\n\nSecond paragraph.",
      credits: [
        { role: "Director", name: "Christian Healy" },
        { role: "DP", name: "Jane Doe" },
      ],
    });
  });

  it("only treats the trailing block of Role: Name lines as credits", () => {
    const film = parseFilm("a.md", "---\nvimeo: 1\n---\nNote: this is prose.\n\nEdit: Sam\n");
    expect(film.description).toBe("Note: this is prose.");
    expect(film.credits).toEqual([{ role: "Edit", name: "Sam" }]);
  });

  it("leaves optional fields undefined", () => {
    const film = parseFilm("a.md", "---\nvimeo: 42\n---\n");
    expect(film).toMatchObject({ vimeoId: "42", description: "", credits: [] });
    expect(film.title).toBeUndefined();
  });

  it("throws a readable error when vimeo is missing or unparseable", () => {
    expect(() => parseFilm("bad.md", "---\ntitle: x\n---\n")).toThrow(/bad\.md.*vimeo/i);
    expect(() => parseFilm("bad.md", "---\nvimeo: youtube.com/x\n---\n")).toThrow(/bad\.md/);
  });
});

describe("parseCaptions", () => {
  it("maps filenames to captions, ignoring blanks and comments", () => {
    const text = "# captions\n020-portrait.jpg | Lisbon, 2025\n\n010-a.jpg|Tokyo\n";
    expect(parseCaptions(text)).toEqual({
      "020-portrait.jpg": "Lisbon, 2025",
      "010-a.jpg": "Tokyo",
    });
  });
});

describe("parseAbout", () => {
  it("returns contact links and renders the bio markdown to html", () => {
    const about = parseAbout(
      "---\nemail: hi@example.com\ninstagram: https://instagram.com/x\n---\nHello **world**.\n",
    );
    expect(about.email).toBe("hi@example.com");
    expect(about.instagram).toBe("https://instagram.com/x");
    expect(about.vimeo).toBeUndefined();
    expect(about.bioHtml).toContain("<strong>world</strong>");
  });
});

describe("parseFilm unlisted videos", () => {
  it("keeps the private-link hash", () => {
    const film = parseFilm("a.md", "---\nvimeo: https://vimeo.com/123/abc99\n---\n");
    expect(film).toMatchObject({ vimeoId: "123", vimeoHash: "abc99" });
  });
});

describe("front-matter comments", () => {
  it("keeps a # that is part of the value", () => {
    const { data } = parseFrontMatter("---\ntitle: Episode #2\nclient: Studio #9\n---\n");
    expect(data).toEqual({ title: "Episode #2", client: "Studio #9" });
  });

  it("still strips a real trailing comment", () => {
    expect(parseFrontMatter("---\nemail: a@b.co   # replace me\n---\n").data["email"]).toBe(
      "a@b.co",
    );
  });
});

describe("credits vs prose", () => {
  it("treats a sentence containing a colon as description, not a credit", () => {
    const film = parseFilm(
      "a.md",
      "---\nvimeo: 1\n---\nCommissioned by Nike: a spring campaign.\n",
    );
    expect(film.description).toBe("Commissioned by Nike: a spring campaign.");
    expect(film.credits).toEqual([]);
  });

  it("still accepts a body that is only credits", () => {
    const film = parseFilm("a.md", "---\nvimeo: 1\n---\nDirector: Christian Healy\nDP: Jane Doe\n");
    expect(film.description).toBe("");
    expect(film.credits).toHaveLength(2);
  });
});
