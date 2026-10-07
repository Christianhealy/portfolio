import { useEffect, useRef } from "react";
import type { Still } from "@/lib/content";
import { stillAlt } from "./alt";
import { Picture } from "./Picture";

interface Props {
  stills: Still[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const SWIPE_MIN = 50;
const pad = (n: number) => String(n).padStart(2, "0");
const FOCUSABLE = "button, [href], [tabindex]:not([tabindex='-1'])";

export function Lightbox({ stills, index, onIndexChange, onClose }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const count = stills.length;
  const still = stills[index];
  const step = (delta: number) => onIndexChange((index + delta + count) % count);

  // Keep the latest handlers without re-binding listeners on every render.
  const latest = useRef({ step, onClose });
  latest.current = { step, onClose };

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") latest.current.onClose();
      else if (event.key === "ArrowRight") latest.current.step(1);
      else if (event.key === "ArrowLeft") latest.current.step(-1);
      else if (event.key === "Tab" && dialog.current) {
        const items = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
        const position = items.indexOf(document.activeElement as HTMLElement);
        const next = (position + (event.shiftKey ? -1 : 1) + items.length) % items.length;
        event.preventDefault();
        items[next]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, []);

  if (!still) return null;
  const alt = stillAlt(still);
  const neighbours =
    count > 1 ? [stills[(index + 1) % count]!, stills[(index - 1 + count) % count]!] : [];

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-50 flex flex-col bg-background text-foreground"
      onTouchStart={(event) => {
        const t = event.touches[0];
        if (t) touch.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(event) => {
        const start = touch.current;
        const t = event.changedTouches[0];
        touch.current = null;
        if (!start || !t) return;
        const dx = t.clientX - start.x;
        if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(t.clientY - start.y)) {
          step(dx < 0 ? 1 : -1);
        }
      }}
    >
      <div className="flex items-center justify-between px-6 py-5 text-[11px] uppercase tracking-[0.22em] sm:px-12">
        <span aria-live="polite" className="tabular-nums">
          {pad(index + 1)} / {pad(count)}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="uppercase tracking-[0.22em] transition-opacity hover:opacity-60"
        >
          Close
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
        <Picture
          key={still.slug}
          image={still.image}
          alt={alt}
          sizes="100vw"
          pictureClassName="contents"
          className="max-h-full w-auto max-w-full object-contain"
          data-lightbox-image=""
        />
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous photo"
          className="absolute inset-y-0 left-0 hidden w-1/4 cursor-w-resize items-center justify-start pl-6 text-[11px] uppercase tracking-[0.22em] opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 sm:flex sm:pl-12"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next photo"
          className="absolute inset-y-0 right-0 hidden w-1/4 cursor-e-resize items-center justify-end pr-6 text-[11px] uppercase tracking-[0.22em] opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 sm:flex sm:pr-12"
        >
          Next
        </button>
      </div>

      <p className="min-h-14 px-6 py-5 text-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {still.caption}
      </p>

      <div data-preload="" aria-hidden="true" className="hidden">
        {neighbours.map((n) => (
          <Picture key={n.slug} image={n.image} alt="" sizes="100vw" loading="eager" />
        ))}
      </div>
    </div>
  );
}
