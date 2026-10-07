import { describe, expect, it } from "vitest";
import { distribute } from "./masonry";

// Items are relative heights (height / width) for equal-width columns.
describe("distribute", () => {
  it("fills columns left to right first, so the first items read across the top", () => {
    expect(distribute([1, 1, 1], 3)).toEqual([[0], [1], [2]]);
  });

  it("puts each next item in the currently shortest column", () => {
    // col0: 2 (tall) | col1: 0.5, then item 2 → col1 (0.5 < 2), item 3 → col1 (1.5 < 2)
    expect(distribute([2, 0.5, 1, 0.25], 2)).toEqual([[0], [1, 2, 3]]);
  });

  it("prefers the leftmost column on ties", () => {
    expect(distribute([1, 1, 1, 1], 2)).toEqual([
      [0, 2],
      [1, 3],
    ]);
  });

  it("handles one column and empty input", () => {
    expect(distribute([1, 2], 1)).toEqual([[0, 1]]);
    expect(distribute([], 3)).toEqual([[], [], []]);
  });
});
