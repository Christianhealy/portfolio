import { createFileRoute, Link } from "@tanstack/react-router";
import { Picture } from "@/components/portfolio/Picture";
import { getHero } from "@/lib/content";

const title = "Christian Healy — Photography & Film";
const description = "Photography and film by Christian Healy.";

export const Route = createFileRoute("/")({
  head: () => {
    const avif = getHero().sources.find((s) => s.type === "image/avif");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
      // The hero is the LCP element: start fetching it before the CSS is parsed.
      links: avif
        ? [
            {
              rel: "preload",
              as: "image",
              type: "image/avif",
              imageSrcSet: avif.srcset,
              imageSizes: "100vw",
              fetchPriority: "high",
            },
          ]
        : [],
    };
  },
  component: Splash,
});

function Splash() {
  const hero = getHero();
  return (
    <main className="relative h-svh w-full overflow-hidden bg-foreground text-background">
      <Picture
        image={hero}
        alt=""
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        pictureClassName="absolute inset-0"
        className="size-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/25" />
      <div className="relative flex h-full flex-col items-center justify-center gap-10 px-6 text-center">
        <h1 className="font-display text-6xl leading-none sm:text-8xl lg:text-9xl">
          Christian Healy
        </h1>
        <Link
          to="/stills"
          className="border-b border-current pb-1 text-[11px] uppercase tracking-[0.22em] transition-opacity hover:opacity-70"
        >
          Enter
        </Link>
      </div>
    </main>
  );
}
