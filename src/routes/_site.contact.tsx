import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/portfolio/Reveal";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Christian Healy" },
      { name: "description", content: "Contact Christian Healy for photography and film commissions." },
      { property: "og:title", content: "Contact — Christian Healy" },
      { property: "og:description", content: "Contact Christian Healy for photography and film commissions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[1600px] items-center px-6 py-20 sm:px-12">
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
        <h1 className="mt-7 max-w-5xl font-display text-5xl leading-tight sm:text-7xl lg:text-8xl">
          Have a project in mind? Let’s make something memorable.
        </h1>
        <a href="mailto:hello@ateliernoir.studio" className="mt-12 inline-flex items-center gap-3 border-b border-foreground pb-2 text-sm transition-opacity hover:opacity-60">
          hello@ateliernoir.studio <ArrowUpRight className="size-4" />
        </a>
      </Reveal>
    </main>
  );
}