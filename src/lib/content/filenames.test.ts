import { describe, expect, it } from "vitest";
import { compareFilenames, slugFromFilename } from "./filenames";

const sorted = (names: string[]) => [...names].sort(compareFilenames);

describe("compareFilenames", () => {
  it("orders numbered files by their number, not lexically", () => {
    expect(sorted(["100-c.jpg", "020-b.jpg", "9-a.jpg"])).toEqual([
      "9-a.jpg",
      "020-b.jpg",
      "100-c.jpg",
    ]);
  });

  it("puts unnumbered files after numbered ones, alphabetically and case-insensitively", () => {
    expect(sorted(["zebra.jpg", "Apple.jpg", "010-x.jpg", "banana.jpg"])).toEqual([
      "010-x.jpg",
      "Apple.jpg",
      "banana.jpg",
      "zebra.jpg",
    ]);
  });

  it("breaks ties between equal numbers by the rest of the name", () => {
    expect(sorted(["010-b.jpg", "010-a.jpg"])).toEqual(["010-a.jpg", "010-b.jpg"]);
  });
});

describe("slugFromFilename", () => {
  it("drops the extension and numeric prefix", () => {
    expect(slugFromFilename("010-nike-spring.md")).toBe("nike-spring");
  });

  it("keeps unnumbered names, lowercased and url-safe", () => {
    expect(slugFromFilename("Desert Road.JPG")).toBe("desert-road");
  });

  it("does not treat a bare number as a prefix", () => {
    expect(slugFromFilename("2025.jpg")).toBe("2025");
  });
});
