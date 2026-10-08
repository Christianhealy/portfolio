import { useEffect, useRef } from "react";
import { useMotionPrefs } from "@/components/motion/useMotionPrefs";
import type { FilmImage } from "@/lib/vimeo";
import { Picture } from "./Picture";

interface Props {
  image: FilmImage;
  title: string;
  /** Optional silent loop; replaces the still image unless reduced motion is on. */
  loop?: string;
  sizes?: string;
}

/** Film tile imagery: poster → Vimeo thumbnail → typographic card, upgraded to a loop. */
export function FilmMedia({ image, title, loop, sizes = "(min-width: 768px) 50vw, 100vw" }: Props) {
  const { reduced } = useMotionPrefs();
  const video = useRef<HTMLVideoElement>(null);
  const showLoop = !!loop && !reduced;

  useEffect(() => {
    const el = video.current;
    if (!showLoop || !el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [showLoop]);

  const ratio =
    image.kind === "poster"
      ? `${image.image.width} / ${image.image.height}`
      : image.kind === "thumbnail"
        ? `${image.width} / ${image.height}`
        : "16 / 9";
  const posterSrc =
    image.kind === "poster" ? image.image.src : image.kind === "thumbnail" ? image.src : undefined;

  return (
    <div className="relative w-full overflow-hidden bg-card" style={{ aspectRatio: ratio }}>
      {image.kind !== "card" && (
        <Picture
          image={
            image.kind === "poster"
              ? image.image
              : { src: image.src, width: image.width, height: image.height, sources: [] }
          }
          alt=""
          sizes={sizes}
          loading="lazy"
          fadeIn
          className="fade-in-image size-full object-cover"
        />
      )}
      {image.kind === "card" && (
        <div className="flex size-full items-center justify-center p-8">
          <p aria-hidden="true" className="text-center font-display text-3xl sm:text-4xl">
            {title}
          </p>
        </div>
      )}
      {showLoop && (
        <video
          ref={video}
          src={loop}
          poster={posterSrc}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  );
}
