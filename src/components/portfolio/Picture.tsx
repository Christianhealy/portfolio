import type { ComponentProps } from "react";
import type { ResponsiveImage } from "@/lib/content";

type Props = Omit<ComponentProps<"img">, "src" | "srcSet" | "width" | "height"> & {
  image: ResponsiveImage;
  alt: string;
  sizes: string;
  pictureClassName?: string;
};

/** AVIF → WebP → JPEG `<picture>` with intrinsic width/height so layout never shifts. */
export function Picture({ image, sizes, pictureClassName, ...img }: Props) {
  return (
    <picture className={pictureClassName}>
      {image.sources.map((source) => (
        <source key={source.type} type={source.type} srcSet={source.srcset} sizes={sizes} />
      ))}
      <img src={image.src} width={image.width} height={image.height} decoding="async" {...img} />
    </picture>
  );
}
