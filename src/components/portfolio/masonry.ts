/**
 * Greedy masonry: each item (relative height = height / width) goes into the currently
 * shortest column, leftmost on ties. Returns item indexes per column. Deterministic, so the
 * server and browser render the same layout from the images' intrinsic sizes.
 */
export function distribute(heights: number[], columns: number): number[][] {
  const result: number[][] = Array.from({ length: columns }, () => []);
  const totals = new Array<number>(columns).fill(0);
  heights.forEach((height, index) => {
    const shortest = totals.indexOf(Math.min(...totals));
    result[shortest]!.push(index);
    totals[shortest]! += height;
  });
  return result;
}
