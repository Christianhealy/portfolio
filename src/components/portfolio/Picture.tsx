import { useLayoutEffect, useRef, useState, type ComponentProps, type Ref } from "react";
import type { ResponsiveImage } from "@/lib/content";

type Props = Omit<ComponentProps<"img">, "src" | "srcSet" | "width" | "height" | "ref"> & {
  image: ResponsiveImage;
  alt: string;
  sizes: string;
  pictureClassName?: string;
  ref?: Ref<HTMLImageElement>;
  /** Fade in from the placeholder once loaded (only if still loading after hydration). */
  fadeIn?: boolean;
};

/** AVIF → WebP → JPEG `<picture>` with intrinsic width/height so layout never shifts. */
export function Picture({ image, sizes, pictureClassName, ref, fadeIn, onLoad, ...img }: Props) {
  const own = useRef<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    if (fadeIn && own.current && !own.current.complete) setLoading(true);
  }, [fadeIn]);

  return (
    <picture className={pictureClassName}>
      {image.sources.map((source) => (
        <source key={source.type} type={source.type} srcSet={source.srcset} sizes={sizes} />
      ))}
      <img
        ref={(el) => {
          own.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        src={image.src}
        width={image.width}
        height={image.height}
        decoding="async"
        data-loading={loading ? "" : undefined}
        onLoad={(event) => {
          setLoading(false);
          onLoad?.(event);
        }}
        {...img}
      />
    </picture>
  );
}
