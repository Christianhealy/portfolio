import { animate } from "motion";
import { useEffect, useLayoutEffect, useRef } from "react";
import { flipFrom, isOnScreen } from "@/components/motion/flip";
import { DURATION, EASE } from "@/components/motion/tokens";
import { useMotionPrefs } from "@/components/motion/useMotionPrefs";
import type { Still } from "@/lib/content";
import { stillAlt } from "./alt";
import { Picture } from "./Picture";

interface Props {
  stills: Still[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** The visible grid thumbnail for a slug, so open/close can zoom from/to it. */
  getThumbnail?: (slug: string) => HTMLElement | null;
}

const SWIPE_MIN = 50;
const SLIDE = 60;
const pad = (n: number) => String(n).padStart(2, "0");
const FOCUSABLE = "button, [href], [tabindex]:not([tabindex='-1'])";
const zoom = { duration: DURATION.lightbox, ease: EASE };

export function Lightbox({ stills, index, onIndexChange, onClose, getThumbnail }: Props) {
  const { reduced } = useMotionPrefs();
  const dialog = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const shownIndex = useRef<number | null>(null);
  const closing = useRef(false);
  // The thumbnail the zoom lands on is hidden while zooming, or the photo would appear twice.
  const hiddenThumb = useRef<HTMLElement | null>(null);
  const hideThumb = (el: HTMLElement | null) => {
    if (hiddenThumb.current) hiddenThumb.current.style.visibility = "";
    hiddenThumb.current = el;
    if (el) el.style.visibility = "hidden";
  };
  // Back can unmount us mid-exit-animation; a late onClose would then navigate twice.
  const unmounted = useRef(false);
  const count = stills.length;
  const still = stills[index];
  const step = (delta: number) => onIndexChange((index + delta + count) % count);

  /** The thumbnail and its box if it's on screen, for the shared-layout zoom. */
  const origin = () => {
    if (reduced || !still || !getThumbnail) return null;
    const thumb = getThumbnail(still.slug);
    const box = thumb?.getBoundingClientRect();
    return thumb && box && isOnScreen(box, window.innerWidth, window.innerHeight)
      ? { thumb, box }
      : null;
  };

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const from = origin();
    const fade = { duration: reduced ? DURATION.reduced : DURATION.chrome };
    const zooming = from && image.current && backdrop.current;
    hideThumb(zooming ? from.thumb : null);
    const done =
      zooming && image.current && backdrop.current
        ? Promise.all([
            animate(image.current, flipFrom(from.box, image.current.getBoundingClientRect()), zoom)
              .finished,
            animate(backdrop.current, { opacity: 0 }, fade).finished,
            ...[...(dialog.current?.querySelectorAll("[data-lightbox-ui]") ?? [])].map(
              (el) => animate(el, { opacity: 0 }, fade).finished,
            ),
          ])
        : animate(dialog.current!, { opacity: 0 }, fade).finished;
    void done.then(() => {
      if (unmounted.current) return;
      // The photo now sits exactly over its thumbnail: swap them, then go.
      hideThumb(null);
      onClose();
    });
  };

  // Keep the latest handlers without re-binding listeners on every render.
  const latest = useRef({ step, close });
  latest.current = { step, close };

  // Open: zoom out of the thumbnail (or fade). Step: slide in from the direction of travel.
  useLayoutEffect(() => {
    const img = image.current;
    const previous = shownIndex.current;
    shownIndex.current = index;
    if (!img || !dialog.current) return;
    if (previous === null) {
      const from = origin();
      if (from && backdrop.current) {
        hideThumb(from.thumb);
        const { x, y, scale } = flipFrom(from.box, img.getBoundingClientRect());
        animate(img, { x: [x, 0], y: [y, 0], scale: [scale, 1] }, zoom);
        animate(backdrop.current, { opacity: [0, 1] }, { duration: DURATION.chrome });
      } else {
        const duration = reduced ? DURATION.reduced : DURATION.chrome;
        animate(dialog.current, { opacity: [0, 1] }, { duration });
      }
    } else if (previous !== index) {
      hideThumb(null);
      if (reduced) {
        animate(img, { opacity: [0, 1] }, { duration: DURATION.reduced });
      } else {
        const forward = (index - previous + count) % count === 1;
        const x = forward ? SLIDE : -SLIDE;
        animate(img, { x: [x, 0], opacity: [0, 1] }, { duration: DURATION.chrome, ease: EASE });
      }
    }
    // Only the index drives these animations.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    unmounted.current = false;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") latest.current.close();
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
      unmounted.current = true;
      hideThumb(null);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, []);

  if (!still) return null;
  const alt = stillAlt(still);
  const neighbours =
    count > 1 ? [stills[(index + 1) % count]!, stills[(index - 1 + count) % count]!] : [];
  const ui = "relative text-[11px] uppercase tracking-[0.22em]";

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      data-lenis-prevent=""
      className="fixed inset-0 z-50 flex flex-col text-foreground"
      onTouchStart={(event) => {
        const t = event.touches[0];
        if (t) touch.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchMove={(event) => {
        const start = touch.current;
        const t = event.touches[0];
        if (!start || !t || reduced || !image.current) return;
        image.current.style.transform = `translateX(${t.clientX - start.x}px)`;
      }}
      onTouchEnd={(event) => {
        const start = touch.current;
        const t = event.changedTouches[0];
        touch.current = null;
        if (!start || !t) return;
        const dx = t.clientX - start.x;
        if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(t.clientY - start.y)) {
          step(dx < 0 ? 1 : -1);
        } else if (image.current && !reduced) {
          animate(image.current, { x: [dx, 0] }, { duration: DURATION.chrome, ease: EASE });
        }
      }}
    >
      <div ref={backdrop} aria-hidden="true" className="absolute inset-0 bg-background" />

      <div
        data-lightbox-ui=""
        className={`${ui} flex items-center justify-between px-6 py-5 sm:px-12`}
      >
        <span aria-live="polite" className="tabular-nums">
          {pad(index + 1)} / {pad(count)}
        </span>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="uppercase tracking-[0.22em] transition-opacity hover:opacity-60"
        >
          Close
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <Picture
          key={still.slug}
          ref={image}
          image={still.image}
          alt={alt}
          sizes="100vw"
          pictureClassName="absolute inset-x-4 inset-y-0 [container-type:size] sm:inset-x-20"
          className="absolute inset-0 m-auto h-auto"
          // Fit the stage from the intrinsic size, not the loaded file: an image that hasn't
          // loaded yet has no size, and the open zoom would measure a 0×0 target.
          style={{
            aspectRatio: `${still.image.width} / ${still.image.height}`,
            width: `min(100cqw, 100cqh * ${still.image.width / still.image.height})`,
          }}
          data-lightbox-image=""
        />
        <button
          type="button"
          data-lightbox-ui=""
          onClick={() => step(-1)}
          aria-label="Previous photo"
          className={`${ui} absolute inset-y-0 left-0 hidden w-1/4 cursor-w-resize items-center justify-start pl-6 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 sm:flex sm:pl-12`}
        >
          Prev
        </button>
        <button
          type="button"
          data-lightbox-ui=""
          onClick={() => step(1)}
          aria-label="Next photo"
          className={`${ui} absolute inset-y-0 right-0 hidden w-1/4 cursor-e-resize items-center justify-end pr-6 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 sm:flex sm:pr-12`}
        >
          Next
        </button>
      </div>

      <p
        data-lightbox-ui=""
        className={`${ui} min-h-14 px-6 py-5 text-center text-muted-foreground`}
      >
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
