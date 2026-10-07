import { describe, expect, it, vi } from "vitest";
import type { FilmEntry, ResponsiveImage } from "./content/types";
import {
  createOEmbedClient,
  filmImage,
  filmRefs,
  filmTitle,
  parseVimeo,
  parseVimeoId,
  vimeoPlayerUrl,
} from "./vimeo";

describe("parseVimeoId", () => {
  it.each([
    ["123456789", "123456789"],
    ["https://vimeo.com/123456789", "123456789"],
    ["vimeo.com/123456789/abcdef1234", "123456789"],
    ["https://player.vimeo.com/video/76979871?h=abc", "76979871"],
    ["https://vimeo.com/channels/staffpicks/123456", "123456"],
  ])("parses %s", (input, id) => {
    expect(parseVimeoId(input)).toBe(id);
  });

  it.each(["", "https://youtube.com/watch?v=1", "vimeo.com/about"])("rejects %s", (input) => {
    expect(parseVimeoId(input)).toBeNull();
  });
});

describe("parseVimeo", () => {
  it("keeps the private-link hash that unlisted videos need", () => {
    expect(parseVimeo("https://vimeo.com/123456789/abcdef1234")).toEqual({
      id: "123456789",
      hash: "abcdef1234",
    });
    expect(parseVimeo("https://player.vimeo.com/video/76979871?h=abc12")).toEqual({
      id: "76979871",
      hash: "abc12",
    });
    expect(parseVimeo("123")).toEqual({ id: "123" });
    expect(parseVimeo("nope")).toBeNull();
  });
});

describe("vimeoPlayerUrl", () => {
  it("builds a privacy-friendly embed url, passing the hash for unlisted videos", () => {
    expect(vimeoPlayerUrl({ id: "1" })).toBe("https://player.vimeo.com/video/1?dnt=1");
    expect(vimeoPlayerUrl({ id: "1", hash: "ab" })).toBe(
      "https://player.vimeo.com/video/1?h=ab&dnt=1",
    );
  });
});

const oembed = {
  title: "The Mountain",
  thumbnail_url: "https://i.vimeocdn.com/video/1-d_1280?region=us",
  thumbnail_width: 1280,
  thumbnail_height: 720,
};
const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe("createOEmbedClient", () => {
  it("fetches title and a 1280px thumbnail from Vimeo's oEmbed endpoint", async () => {
    const fetch = vi.fn(async (_url: string, _init?: RequestInit) => ok(oembed));
    const meta = await createOEmbedClient(fetch).get("22439234");
    expect(fetch.mock.calls[0]![0]).toBe(
      "https://vimeo.com/api/oembed.json?url=https%3A%2F%2Fvimeo.com%2F22439234&width=1280",
    );
    expect(meta).toEqual({
      title: "The Mountain",
      thumbnail: { src: oembed.thumbnail_url, width: 1280, height: 720 },
    });
  });

  it("includes the hash for unlisted videos", async () => {
    const fetch = vi.fn(async (_url: string, _init?: RequestInit) => ok(oembed));
    await createOEmbedClient(fetch).get("5", "ab12");
    expect(fetch.mock.calls[0]![0]).toContain("url=https%3A%2F%2Fvimeo.com%2F5%2Fab12&");
  });

  it("caches results per id", async () => {
    const fetch = vi.fn(async () => ok(oembed));
    const client = createOEmbedClient(fetch);
    await client.get("1");
    await client.get("1");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("returns null instead of throwing when Vimeo is unreachable or says 404", async () => {
    const down = createOEmbedClient(async () => {
      throw new Error("network down");
    });
    expect(await down.get("1")).toBeNull();
    const missing = createOEmbedClient(async () => new Response("Not Found", { status: 404 }));
    expect(await missing.get("1")).toBeNull();
  });

  it("retries a failed lookup after a few minutes rather than caching it for good", async () => {
    let now = 0;
    const fetch = vi.fn(async () => new Response("", { status: 500 }));
    const client = createOEmbedClient(fetch, { now: () => now });
    await client.get("1");
    await client.get("1");
    expect(fetch).toHaveBeenCalledTimes(1);
    now += 10 * 60 * 1000;
    await client.get("1");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

const image: ResponsiveImage = { src: "/poster.jpg", width: 1600, height: 900, sources: [] };
const film = (extra: Partial<FilmEntry> = {}): FilmEntry => ({
  slug: "nike-spring",
  filename: "010-nike-spring.md",
  vimeoId: "1",
  description: "",
  credits: [],
  ...extra,
});
const meta = { title: "From Vimeo", thumbnail: { src: "/thumb.jpg", width: 1280, height: 720 } };

describe("filmTitle", () => {
  it("prefers front-matter, then the Vimeo title, then the slug", () => {
    expect(filmTitle(film({ title: "Spring" }), meta)).toBe("Spring");
    expect(filmTitle(film(), meta)).toBe("From Vimeo");
    expect(filmTitle(film(), null)).toBe("Nike Spring");
  });
});

describe("filmImage", () => {
  it("prefers the local poster, then the Vimeo thumbnail, then a typographic card", () => {
    expect(filmImage(film({ poster: image }), meta)).toEqual({ kind: "poster", image });
    expect(filmImage(film(), meta)).toEqual({ kind: "thumbnail", ...meta.thumbnail });
    expect(filmImage(film(), null)).toEqual({ kind: "card" });
    expect(filmImage(film(), { title: "x" })).toEqual({ kind: "card" });
  });
});

describe("filmRefs", () => {
  it("maps films to the refs oEmbed needs, keeping hashes only when present", () => {
    expect(filmRefs([film({ vimeoId: "1" }), film({ vimeoId: "2", vimeoHash: "ab" })])).toEqual([
      { id: "1" },
      { id: "2", hash: "ab" },
    ]);
  });
});
