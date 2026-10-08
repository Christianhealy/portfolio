import { describe, expect, it } from "vitest";
import { validateContent, type ContentListing } from "./validate";

const MB = 1024 * 1024;

const ok: ContentListing = {
  hero: [{ name: "hero.jpg", size: 2 * MB }],
  stills: [
    { name: "010-a.jpg", size: 3 * MB },
    { name: "020-b.webp", size: 1 * MB },
    { name: "captions.txt", size: 100 },
  ],
  film: [
    { name: "010-nike.md", size: 300 },
    { name: "010-nike.mp4", size: 5 * MB },
    { name: "010-nike.jpg", size: 1 * MB },
  ],
  about: [
    { name: "about.md", size: 500 },
    { name: "portrait.jpg", size: 2 * MB },
  ],
  captions: { "010-a.jpg": "Tokyo" },
};

// Swapping a folder's files clears captions so unrelated "missing caption target" warnings
// don't leak into tests about other rules.
const withFolder = (
  folder: keyof Omit<ContentListing, "captions">,
  files: ContentListing["hero"],
) => ({
  ...ok,
  captions: {},
  [folder]: files,
});

describe("validateContent", () => {
  it("accepts a well-formed content folder", () => {
    expect(validateContent(ok)).toEqual({ errors: [], warnings: [] });
  });

  it("errors on an image over 25 MB and warns over 10 MB", () => {
    const result = validateContent(
      withFolder("stills", [
        { name: "010-huge.jpg", size: 26 * MB },
        { name: "020-big.jpg", size: 11 * MB },
      ]),
    );
    expect(result.errors).toEqual([expect.stringMatching(/stills\/010-huge\.jpg.*25 MB/)]);
    expect(result.warnings).toEqual([expect.stringMatching(/stills\/020-big\.jpg/)]);
  });

  it("errors on a loop over 10 MB and warns over 8 MB", () => {
    const result = validateContent(
      withFolder("film", [
        { name: "010-a.md", size: 1 },
        { name: "010-a.mp4", size: 11 * MB },
        { name: "020-b.md", size: 1 },
        { name: "020-b.mp4", size: 9 * MB },
      ]),
    );
    expect(result.errors).toEqual([expect.stringMatching(/film\/010-a\.mp4.*10 MB/)]);
    expect(result.warnings).toEqual([expect.stringMatching(/film\/020-b\.mp4/)]);
  });

  it("errors on unsupported file types, but ignores hidden files like .DS_Store", () => {
    const result = validateContent(
      withFolder("stills", [
        { name: "010-a.heic", size: 1 },
        { name: "notes.pdf", size: 1 },
        { name: ".DS_Store", size: 1 },
      ]),
    );
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toMatch(/stills\/010-a\.heic/);
  });

  it("requires exactly one hero image", () => {
    expect(validateContent(withFolder("hero", [])).errors).toEqual([
      expect.stringMatching(/hero.*exactly one/i),
    ]);
    const two = [
      { name: "a.jpg", size: 1 },
      { name: "b.jpg", size: 1 },
    ];
    expect(validateContent(withFolder("hero", two)).errors).toHaveLength(1);
  });

  it("errors on duplicate slugs", () => {
    const result = validateContent(
      withFolder("stills", [
        { name: "010-desert.jpg", size: 1 },
        { name: "020-desert.jpg", size: 1 },
      ]),
    );
    expect(result.errors).toEqual([expect.stringMatching(/desert/)]);
  });

  it("errors on a loop or poster with no matching film file", () => {
    const result = validateContent(withFolder("film", [{ name: "010-orphan.mp4", size: 1 }]));
    expect(result.errors).toEqual([expect.stringMatching(/010-orphan\.mp4.*010-orphan\.md/)]);
  });

  it("warns when captions.txt names a missing file", () => {
    const result = validateContent({ ...ok, captions: { "999-gone.jpg": "x" } });
    expect(result.warnings).toEqual([expect.stringMatching(/999-gone\.jpg/)]);
  });
});

describe("validateContent filename edge cases", () => {
  it("rejects mixed-case extensions (the site only loads .jpg or .JPG, not .Jpg)", () => {
    const result = validateContent(withFolder("hero", [{ name: "h.Jpg", size: 1 }]));
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/hero\/h\.Jpg.*\.jpg/)]),
    );
  });

  it("accepts all-upper-case extensions straight from a camera", () => {
    expect(
      validateContent(withFolder("stills", [{ name: "IMG_0001.JPG", size: 1 }])).errors,
    ).toEqual([]);
  });

  it("rejects names that leave nothing usable for the web address", () => {
    const result = validateContent(withFolder("stills", [{ name: "010-東京.jpg", size: 1 }]));
    expect(result.errors).toEqual([expect.stringMatching(/stills\/010-東京\.jpg.*letters/)]);
  });
});
