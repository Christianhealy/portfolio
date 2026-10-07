import Lenis from "lenis";
import { cubicBezier } from "motion";
import { useEffect } from "react";
import { EASE } from "./tokens";
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
    const lenis = new Lenis({ autoRaf: true, duration: 1.1, easing: cubicBezier(...EASE) });
    return () => lenis.destroy();
  }, [smoothScroll]);

  return null;
}
