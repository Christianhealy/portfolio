import { useEffect, useRef, useState } from "react";

const TOP = 80; // never hide while the header's own height is still in view
const JITTER = 6;

/** Header state: hide on scroll down, show on scroll up; `scrolled` drives the blur. */
export function useScrollChrome() {
  const [state, setState] = useState({ hidden: false, scrolled: false });
  const last = useRef(0);

  useEffect(() => {
    last.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last.current;
      if (Math.abs(delta) < JITTER) return;
      last.current = y;
      const next = { hidden: delta > 0 && y > TOP, scrolled: y > 0 };
      setState((prev) =>
        prev.hidden === next.hidden && prev.scrolled === next.scrolled ? prev : next,
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return state;
}
