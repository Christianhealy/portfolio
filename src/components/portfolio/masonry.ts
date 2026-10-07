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

/** The on-screen thumbnail for a slug (only one of the per-breakpoint copies is visible). */
export function thumbnailBox(slug: string): DOMRect | null {
  for (const img of document.querySelectorAll(`[data-slug="${CSS.escape(slug)}"] img`)) {
    if (img.getClientRects().length > 0) return img.getBoundingClientRect();
  }
  return null;
}
