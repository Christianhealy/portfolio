import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbox } from "./Lightbox";
import {
  fetchPortfolio,
  videoThumbnail,
  vimeoEmbedUrl,
  type PortfolioItem,
  type MediaType,
} from "./media";
import { Reveal } from "./Reveal";
import { VimeoPreview } from "./VimeoPreview";

export function PortfolioGallery({ mediaType }: { mediaType: MediaType }) {
  const [active, setActive] = useState<PortfolioItem | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
  });

  const isMotion = mediaType === "video";
  const items = data ?? [];
  const visible = items.filter((item) => item.type === mediaType);

  return (
    <>
      <section
        aria-label={isMotion ? "Film gallery" : "Photo gallery"}
        className="mx-auto max-w-[1050px] px-6 pb-24 pt-8 sm:px-12 sm:pb-32 sm:pt-10"
      >
        {isLoading && <p className="text-sm text-muted-foreground">Loading gallery…</p>}
        {isError && <p className="text-sm text-muted-foreground">The gallery could not load.</p>}

        {!isLoading && !isError && visible.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No {mediaType === "image" ? "photos" : "films"} yet.
          </p>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {visible.map((item, index) => {
            const poster =
              item.type === "image"
                ? item.mediaUrl
                : (item.thumbnailUrl ?? videoThumbnail(item.mediaUrl));
            const previewUrl = item.type === "video" ? vimeoEmbedUrl(item.mediaUrl, true) : null;
            return (
              <Reveal key={item.id} delay={(index % 3) * 110} className="break-inside-avoid">
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={`Open ${item.title}`}
                  onPointerEnter={(event) => {
                    if (
                      event.pointerType === "mouse" &&
                      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    )
                      setPreviewId(item.id);
                  }}
                  onPointerLeave={() => setPreviewId(null)}
                  onFocus={() => {
                    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
                      setPreviewId(item.id);
                  }}
                  onBlur={() => setPreviewId(null)}
                  onClick={() => {
                    setPreviewId(null);
                    setActive(item);
                  }}
                  className="group relative block aspect-[4/3] h-auto w-full overflow-hidden rounded-none bg-card p-0 text-left hover:bg-card"
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-b from-secondary to-card">
                      <p className="absolute inset-x-4 bottom-5 text-center font-display text-xl whitespace-normal">
                        {item.title}
                      </p>
                    </div>
                  )}
                  {previewId === item.id && previewUrl && !active && (
                    <VimeoPreview src={previewUrl} title={item.title} />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  {item.type === "video" && !(previewId === item.id && previewUrl) && (
                    <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/40 bg-background/40 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                      <Play className="size-4 translate-x-px fill-foreground text-foreground" />
                    </span>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-6 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="font-display text-xl">{item.title}</p>
                  </div>
                </Button>
              </Reveal>
            );
          })}
        </div>
      </section>
      <Lightbox item={active} onClose={() => setActive(null)} />
    </>
  );
}
