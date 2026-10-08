import { createFileRoute } from "@tanstack/react-router";

import { ScrambleLink } from "@/components/portfolio/ScrambleLink";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Christian Healy — Photography & Cinematography" },
      {
        name: "description",
        content:
          "Selected photography and cinematography work: portraits, landscapes, street and brand films.",
      },
      { property: "og:title", content: "Christian Healy — Photography & Cinematography" },
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
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-background px-6">
      <ScrambleLink
        label="Enter"
        to="/motion"
        className="group relative inline-flex items-center justify-center border border-foreground px-12 py-4 text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background"
      />
    </main>
  );
}
