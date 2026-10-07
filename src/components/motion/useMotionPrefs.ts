import { useSyncExternalStore } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";
const FINE = "(hover: hover) and (pointer: fine)";

export interface MotionPrefs {
  /** Reduced motion: no parallax, zooms, slides or loops — only ≤ 200 ms fades. */
  reduced: boolean;
  /** Lenis smooth scroll: desktop fine pointers only, never with reduced motion. */
  smoothScroll: boolean;
}

const PREFS: Record<string, MotionPrefs> = {
  "0": { reduced: false, smoothScroll: false },
  "1": { reduced: false, smoothScroll: true },
  "2": { reduced: true, smoothScroll: false },
};

function subscribe(onChange: () => void) {
  const queries = [matchMedia(REDUCE), matchMedia(FINE)];
  queries.forEach((q) => q.addEventListener("change", onChange));
  return () => queries.forEach((q) => q.removeEventListener("change", onChange));
}

// A string snapshot keeps useSyncExternalStore's identity check cheap and stable.
const snapshot = () => (matchMedia(REDUCE).matches ? "2" : matchMedia(FINE).matches ? "1" : "0");
// Server render assumes reduced motion: content is visible and static until hydration.
const serverSnapshot = () => "2";

/** The single source of truth for motion decisions (spec §6). */
export function useMotionPrefs(): MotionPrefs {
  return PREFS[useSyncExternalStore(subscribe, snapshot, serverSnapshot)]!;
}
