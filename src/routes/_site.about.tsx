import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/portfolio/Reveal";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About — Atelier Noir" },
      { name: "description", content: "About Atelier Noir and its approach to photography and cinematography." },
      { property: "og:title", content: "About — Atelier Noir" },
      { property: "og:description", content: "About Atelier Noir and its approach to photography and cinematography." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto grid max-w-[1600px] gap-12 px-6 py-20 sm:px-12 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
      <Reveal>
        <img src="/images/portfolio/photo3.jpg" alt="Portrait from the Atelier Noir archive" className="aspect-[4/5] w-full object-cover" />
      </Reveal>
      <Reveal delay={140}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">About</p>
        <h1 className="mt-6 max-w-2xl font-display text-5xl leading-tight sm:text-7xl">
          Images with feeling, restraint and a point of view.
        </h1>
        <p className="mt-10 max-w-xl text-sm leading-7 text-muted-foreground">
          Atelier Noir creates still and moving images for people, publications and brands. The work is grounded in honest moments, considered light and enduring visual language.
        </p>
      </Reveal>
    </main>
  );
}