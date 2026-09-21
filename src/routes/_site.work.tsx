import { createFileRoute } from "@tanstack/react-router";
import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Selected Work — Atelier Noir" },
      { name: "description", content: "Photography and cinematography selected work by Atelier Noir." },
      { property: "og:title", content: "Selected Work — Atelier Noir" },
      { property: "og:description", content: "Photography and cinematography selected work by Atelier Noir." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkPage,
});

function WorkPage() {
  return (
    <main>
      <section className="mx-auto max-w-[1600px] px-6 pt-20 sm:px-12 sm:pt-28">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Selected work — 2026</p>
        <h1 className="mt-6 font-display text-6xl sm:text-8xl">Work</h1>
      </section>
      <PortfolioGallery />
    </main>
  );
}