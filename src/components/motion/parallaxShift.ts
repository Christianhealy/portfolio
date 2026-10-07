import { PARALLAX } from "./tokens";

/** Scroll progress (0 = entering at the bottom, 1 = leaving at the top) → translateY. */
export function parallaxShift(progress: number): string {
  const p = Math.min(1, Math.max(0, progress));
  const percent = Math.round((PARALLAX - 2 * PARALLAX * p) * 1000) / 10;
  return `${percent === 0 ? 0 : percent}%`;
}
