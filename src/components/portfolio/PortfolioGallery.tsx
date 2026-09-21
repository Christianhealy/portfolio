import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbox } from "./Lightbox";
import { fetchPortfolio, videoThumbnail, type PortfolioItem } from "./media";
import { Reveal } from "./Reveal";

export function PortfolioGallery() {
  const [active, setActive] = useState<PortfolioItem | null>(null);
  const [filter, setFilter] = useState("All");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
  });

  const items = data ?? [];
  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))];
  const visible = filter === "All" ? items : items.filter((item) => item.category === filter);

  return (
    <>
      <section className="mx-auto max-w-[1600px] px-6 pb-24 pt-20 sm:px-12 sm:pb-32 sm:pt-28">
        <Reveal>
          <div className="mb-14 flex flex-wrap gap-x-7 gap-y-2 border-t border-border/60 pt-5">
            {categories.map((category) => (
              <Button
                key={category}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFilter(category)}
                className={`h-auto rounded-none px-0 py-1 text-[10px] uppercase tracking-[0.2em] hover:bg-transparent ${
                  filter === category
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </Reveal>

        {isLoading && <p className="text-sm text-muted-foreground">Loading gallery…</p>}
        {isError && <p className="text-sm text-muted-foreground">The gallery could not load.</p>}

        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {visible.map((item, index) => {
            const poster = item.type === "image" ? item.mediaUrl : videoThumbnail(item.mediaUrl);
            return (
              <Reveal key={item.id} delay={(index % 3) * 110} className="break-inside-avoid">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActive(item)}
                  className="group relative block h-auto w-full overflow-hidden rounded-none bg-card p-0 text-left hover:bg-card"
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt={item.title}
                      loading="lazy"
                      className="w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-b from-secondary to-card">
                      <p className="px-6 text-center font-display text-2xl">{item.title}</p>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  {item.type === "video" && (
                    <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/40 bg-background/40 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                      <Play className="size-4 translate-x-px fill-foreground text-foreground" />
                    </span>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-6 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="font-display text-xl">{item.title}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {item.category}
                    </p>
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