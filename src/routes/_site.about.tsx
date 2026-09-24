import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/portfolio/Reveal";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About — Christian Healy" },
      { name: "description", content: "About Christian Healy and its approach to photography and cinematography." },
      { property: "og:title", content: "About — Christian Healy" },
      { property: "og:description", content: "About Christian Healy and its approach to photography and cinematography." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto grid max-w-[1050px] items-center gap-10 px-6 py-16 sm:px-12 sm:py-20 md:grid-cols-[280px_minmax(0,1fr)] md:gap-14">
      <Reveal className="mx-auto w-full max-w-[280px]">
        <img src="/images/portfolio/photo3.jpg" alt="Portrait from the Christian Healy archive" className="aspect-[4/5] w-full object-cover" />
      </Reveal>
      <Reveal delay={140}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">About</p>
        <h1 className="mt-6 max-w-2xl font-display text-4xl leading-tight lg:text-5xl">
          Images with feeling, restraint and a point of view.
        </h1>
        <p className="mt-10 max-w-xl text-sm leading-7 text-muted-foreground">
          Christian Healy creates still and moving images for people, publications and brands. The work is grounded in honest moments, considered light and enduring visual language.
        </p>
      </Reveal>
    </main>
  );
}
