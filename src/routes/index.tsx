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
      <h1 className="sr-only">Christian Healy</h1>
      <Picture
        image={hero}
        alt=""
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        pictureClassName="splash-hero absolute inset-0 block"
        className="size-full object-cover"
      />
      {/* A soft pool of shade behind Enter, so it reads on any photo without dimming it all. */}
      <div aria-hidden="true" className="splash-shade absolute inset-0" />
      <div className="relative grid h-full place-items-center">
        <Link to="/stills" className="splash-enter">
          Enter
        </Link>
      </div>
    </main>
  );
}
