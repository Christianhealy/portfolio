import Lenis from "lenis";
import { useEffect } from "react";
import { SCROLL_LERP } from "./tokens";
import { useMotionPrefs } from "./useMotionPrefs";

/**
 * Lenis smooth scrolling on desktop fine-pointer devices only (spec §6). Native scroll on
 * touch, under reduced motion, and inside anything marked `data-lenis-prevent` (the lightbox,
 * the Vimeo player, the mobile menu).
 */
export function SmoothScroll() {
  const { smoothScroll } = useMotionPrefs();

  useEffect(() => {
    if (!smoothScroll) return;
    // Lerp, not a fixed duration: a duration restarts its ease on every wheel notch, so the page
    // trails the wheel and keeps gliding long after it stops.
    const lenis = new Lenis({ autoRaf: true, lerp: SCROLL_LERP });
    return () => lenis.destroy();
  }, [smoothScroll]);

  return null;
}
