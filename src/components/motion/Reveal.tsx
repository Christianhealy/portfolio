import { useLayoutEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { useMotionPrefs } from "./useMotionPrefs";

interface Props {
  children: ReactNode;
  /** Seconds; used for per-column stagger. Ignored under reduced motion. */
  delay?: number;
  /** "rise": fade + 24px rise. "mask": the line slides up from behind a mask (headings). */
  variant?: "rise" | "mask";
  as?: ElementType;
  className?: string;
}

/**
 * Scroll-in reveal (spec §6). Only content that starts *below the fold* is hidden, and only
 * once JS runs, so server-rendered pages are never blank and nothing on screen flashes after
 * hydration. Styles live in styles.css under [data-reveal].
 */
export function Reveal({
  children,
  delay = 0,
  variant = "rise",
  as: Tag = "div",
  className,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const [state, setState] = useState<"pending" | "shown" | undefined>();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
    setState("pending");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setState("shown");
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal={state}
      data-reveal-mode={reduced ? "fade" : variant}
      style={state && !reduced && delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {variant === "mask" ? <span className="reveal-line">{children}</span> : children}
    </Tag>
  );
}
