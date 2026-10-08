// Shared motion tokens (spec §6). CSS mirrors these as --ease-out-expo / --duration-* in
// styles.css; keep the two in sync.
export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

export const DURATION = {
  /** Reduced-motion fades: never longer than this. */
  reduced: 0.2,
  chrome: 0.4,
  reveal: 0.9,
  lightbox: 0.5,
} as const;

/** Reveal rise distance (px) and per-column stagger (s). */
export const REVEAL_RISE = 24;
export const REVEAL_STAGGER = 0.06;
/** Parallax travel as a fraction of the element's height (±). */
export const PARALLAX = 0.06;
/** Lenis smoothing: the share of the remaining distance covered per 60 Hz frame. */
export const SCROLL_LERP = 0.2;
