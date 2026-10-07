import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { parallaxShift } from "./parallaxShift";
import { useMotionPrefs } from "./useMotionPrefs";

/**
 * Subtle vertical drift (≤ ±6 %) for the splash hero, about portrait and film posters only —
 * never masonry tiles. Static under reduced motion.
 */
export function Parallax({ children, className }: { children: ReactNode; className?: string }) {
  const { reduced } = useMotionPrefs();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, parallaxShift);
  return (
    <div ref={ref} className={className}>
      {/* Same DOM either way, so switching after hydration never remounts the image. */}
      <motion.div
        data-parallax={reduced ? undefined : ""}
        style={reduced ? {} : { y }}
        className="size-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
