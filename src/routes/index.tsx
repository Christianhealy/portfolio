import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Play } from "lucide-react";
import { Reveal } from "@/components/portfolio/Reveal";
import { Lightbox } from "@/components/portfolio/Lightbox";
import { fetchPortfolio, videoThumbnail, type PortfolioItem } from "@/components/portfolio/media";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier Noir — Photography & Cinematography" },
      {
        name: "description",
        content:
          "Selected photography and cinematography work: portraits, landscapes, street and brand films.",
      },
      { property: "og:title", content: "Atelier Noir — Photography & Cinematography" },
      {
        property: "og:description",
        content:
          "Selected photography and cinematography work: portraits, landscapes, street and brand films.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [active, setActive] = useState<PortfolioItem | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
  });

  const items = data ?? [];
  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const visible = filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto max-w-[1600px] px-6 pt-10 sm:px-12">
        <div className="flex items-center justify-between border-b border-border/60 pb-6">
          <span className="font-display text-lg tracking-[0.2em] uppercase">Atelier Noir</span>
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Photography · Film
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-6 py-24 sm:px-12 sm:py-36">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
            Selected Work — 2026
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h1 className="mt-8 max-w-4xl font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
            Light, shadow and the quiet moments in between.
          </h1>
        </Reveal>
        <Reveal delay={240}>
          <p className="mt-10 max-w-xl text-sm leading-relaxed text-muted-foreground">
            A portfolio of stills and motion work made for brands, publications and people who care
            about the frame.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 pb-32 sm:px-12">
        <Reveal>
          <div className="mb-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-border/60 pt-6">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`text-[11px] uppercase tracking-[0.25em] transition-colors ${
                  filter === c
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading gallery…</p>
        )}
        {isError && (
          <p className="text-sm text-muted-foreground">
            Could not load the gallery. Check public/portfolio.json.
          </p>
        )}

        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {visible.map((item, i) => {
            const poster =
              item.type === "image" ? item.mediaUrl : videoThumbnail(item.mediaUrl);
            return (
              <Reveal key={item.id} delay={(i % 3) * 110} className="break-inside-avoid">
                <button
                  onClick={() => setActive(item)}
                  className="group relative block w-full overflow-hidden bg-card text-left"
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt={item.title}
                      loading="lazy"
                      className="w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-secondary to-card">
                      <p className="px-6 text-center font-display text-2xl tracking-wide">
                        {item.title}
                      </p>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                  {item.type === "video" && (
                    <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/40 bg-background/40 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                      <Play className="size-4 translate-x-px fill-foreground text-foreground" />
                    </span>
                  )}

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-6 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="font-display text-xl tracking-wide">{item.title}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {item.category}
                    </p>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </section>

      <footer className="mx-auto max-w-[1600px] border-t border-border/60 px-6 py-14 sm:px-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <span className="font-display text-base tracking-[0.2em] uppercase">Atelier Noir</span>
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            hello@ateliernoir.studio
          </span>
        </div>
      </footer>

      <Lightbox item={active} onClose={() => setActive(null)} />
    </main>
  );
}
