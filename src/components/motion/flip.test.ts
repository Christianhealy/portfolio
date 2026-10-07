import { describe, expect, it } from "vitest";
import { flipFrom, isOnScreen } from "./flip";

const rect = (left: number, top: number, width: number, height: number) => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

describe("flipFrom", () => {
  it("returns the transform that makes the target sit exactly on the thumbnail", () => {
    // Thumbnail 100×50 at (0,0); full image 400×200 centred at (500,300).
    expect(flipFrom(rect(0, 0, 100, 50), rect(300, 200, 400, 200))).toEqual({
      x: -450,
      y: -275,
      scale: 0.25,
    });
  });

  it("is the identity when the rects match", () => {
    expect(flipFrom(rect(10, 10, 50, 50), rect(10, 10, 50, 50))).toEqual({ x: 0, y: 0, scale: 1 });
  });
});

describe("isOnScreen", () => {
  it("is true only for a rect that overlaps the viewport", () => {
    expect(isOnScreen(rect(0, 0, 10, 10), 800, 600)).toBe(true);
    expect(isOnScreen(rect(0, 700, 10, 10), 800, 600)).toBe(false);
    expect(isOnScreen(rect(0, -50, 10, 10), 800, 600)).toBe(false);
    expect(isOnScreen(rect(0, 0, 0, 0), 800, 600)).toBe(false);
  });
});
