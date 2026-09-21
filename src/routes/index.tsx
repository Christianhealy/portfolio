import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/portfolio/Reveal";

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
  return (
    <main className="mx-auto max-w-[1600px] px-6 pb-16 pt-10 sm:px-12 sm:pb-24 sm:pt-14">
      <Reveal>
        <div className="relative min-h-[68vh] overflow-hidden">
          <img
            src="/images/portfolio/photo1.jpg"
            alt="Atelier Noir selected photography"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-foreground/75">
              Photography · Film
            </p>
            <h1 className="max-w-4xl font-display text-5xl leading-none sm:text-7xl lg:text-8xl">
              Light, shadow and the quiet moments in between.
            </h1>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
