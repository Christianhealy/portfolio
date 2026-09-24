import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

type ScrambleLinkProps = {
  to: "/" | "/stills" | "/motion" | "/about" | "/contact";
  label: string;
  className?: string;
  activeProps?: { className: string };
  inactiveProps?: { className: string };
  onClick?: () => void;
};

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?#%";
const DURATION = 450;

/** Keeps the real label accessible and its width stable while the visible letters scramble. */
export function ScrambleLink({ label, ...props }: ScrambleLinkProps) {
  const [display, setDisplay] = useState(label);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
    setDisplay(label);
  };

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reset = () => {
      if (timer.current !== null) clearInterval(timer.current);
      timer.current = null;
      setDisplay(label);
    };
    reset();
    preference.addEventListener("change", reset);
    return () => {
      if (timer.current !== null) clearInterval(timer.current);
      preference.removeEventListener("change", reset);
    };
  }, [label]);

  const scramble = () => {
    stop();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const started = performance.now();
    const tick = () => {
      const progress = (performance.now() - started) / DURATION;
      if (progress >= 1) {
        stop();
        return;
      }
      const resolved = Math.floor(progress * label.length);
      setDisplay(
        Array.from(label, (letter, index) =>
          index < resolved || /\s/.test(letter)
            ? letter
            : GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length)),
        ).join(""),
      );
    };
    tick();
    timer.current = setInterval(tick, 40);
  };

  return (
    <Link
      {...props}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") scramble();
      }}
      onPointerLeave={stop}
      onFocus={scramble}
      onBlur={stop}
    >
      <span className="relative inline-block">
        <span className="invisible" aria-hidden="true">
          {label}
        </span>
        <span className="absolute inset-0 whitespace-nowrap" aria-hidden="true">
          {display}
        </span>
        <span className="sr-only">{label}</span>
      </span>
    </Link>
  );
}
