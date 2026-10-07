// @vitest-environment node
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { checkContent, contentPlugin, listContent } from "./vite-plugin";

const fixture = (name: string) =>
  fileURLToPath(new URL(`../../content/__fixtures__/${name}`, import.meta.url));

describe("listContent", () => {
  it("lists each content folder with real byte sizes and reads captions.txt", () => {
    const listing = listContent(fixture("valid"));
    expect(listing.hero).toEqual([{ name: "hero.jpg", size: expect.any(Number) }]);
    expect(listing.hero[0]!.size).toBeGreaterThan(1000);
    expect(listing.stills.map((f) => f.name)).toContain("captions.txt");
    expect(listing.captions).toEqual({ "020-portrait.jpg": "Lisbon, 2025" });
  });

  it("treats a missing folder as empty", () => {
    expect(listContent(fixture("broken")).film.map((f) => f.name)).toEqual([
      "010-no-vimeo.md",
      "020-orphan.mp4",
    ]);
    expect(listContent(fixture("does-not-exist")).hero).toEqual([]);
  });
});

describe("checkContent", () => {
  it("passes the valid fixture", () => {
    expect(checkContent(fixture("valid"))).toEqual({ errors: [], warnings: [] });
  });

  it("reports every problem in the broken fixture, including film files without vimeo", () => {
    const { errors } = checkContent(fixture("broken"));
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/hero.*exactly one/i),
        expect.stringMatching(/030-phone\.heic/),
        expect.stringMatching(/desert/),
        expect.stringMatching(/020-orphan\.mp4/),
        expect.stringMatching(/010-no-vimeo\.md.*vimeo/i),
      ]),
    );
  });
});

describe("contentPlugin", () => {
  const run = (root: string) => {
    const calls = { error: [] as string[], warn: [] as string[] };
    const plugin = contentPlugin({ root });
    const ctx = {
      error: (message: string) => {
        calls.error.push(message);
        throw new Error(message);
      },
      warn: (message: string) => calls.warn.push(message),
    };
    let thrown: unknown;
    try {
      (plugin.buildStart as unknown as (this: typeof ctx) => void).call(ctx);
    } catch (error) {
      thrown = error;
    }
    return { ...calls, thrown };
  };

  it("fails the build with every error listed", () => {
    const { error, thrown } = run(fixture("broken"));
    expect(thrown).toBeDefined();
    expect(error[0]).toMatch(/src\/content has problems/);
    expect(error[0]).toMatch(/030-phone\.heic/);
    expect(error[0]).toMatch(/010-no-vimeo\.md/);
  });

  it("lets a valid folder through silently", () => {
    expect(run(fixture("valid"))).toEqual({ error: [], warn: [], thrown: undefined });
  });

  it("swaps any module that has a .fixtures.ts twin when fixtures are on", () => {
    const lib = fileURLToPath(new URL("../", import.meta.url));
    const resolve = (fixtures: boolean, id: string, importer: string) =>
      (
        contentPlugin({ root: fixture("valid"), fixtures }).resolveId as unknown as (
          id: string,
          importer?: string,
        ) => string | null
      )(id, importer);
    expect(resolve(true, "./source", `${lib}content/index.ts`)).toBe(
      `${lib}content/source.fixtures.ts`,
    );
    expect(resolve(true, "./oembed-fetch", `${lib}vimeo-meta.ts`)).toBe(
      `${lib}oembed-fetch.fixtures.ts`,
    );
    expect(resolve(true, "./parse", `${lib}content/index.ts`)).toBeNull();
    expect(resolve(false, "./source", `${lib}content/index.ts`)).toBeNull();
  });
});
