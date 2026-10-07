import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { Lightbox } from "@/components/portfolio/Lightbox";
import { MasonryGrid } from "@/components/portfolio/MasonryGrid";
import { thumbnailBox } from "@/components/portfolio/masonry";
import { getStills } from "@/lib/content";

const title = "Stills — Christian Healy";
const description = "Photography by Christian Healy.";

export const Route = createFileRoute("/_site/stills")({
  validateSearch: (search: Record<string, unknown>): { photo?: string } =>
    typeof search["photo"] === "string" ? { photo: search["photo"] } : {},
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: StillsPage,
});

function StillsPage() {
  const stills = getStills();
  const { photo } = Route.useSearch();
  const navigate = Route.useNavigate();
  const index = photo ? stills.findIndex((s) => s.slug === photo) : -1;
  // Opening from the grid pushes a history entry, so closing goes back (and Back closes).
  // A deep link has nothing to go back to inside the site, so closing replaces instead.
  const pushed = useRef(false);

  const show = (i: number, replace: boolean) =>
    navigate({ search: { photo: stills[i]!.slug }, replace, resetScroll: false });

  const close = () => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    } else {
      navigate({ search: {}, replace: true, resetScroll: false });
    }
  };

  return (
    <main className="mx-auto max-w-[1600px] px-4 pb-16 pt-8 sm:px-12 sm:pt-12">
      <h1 className="sr-only">Stills</h1>
      <MasonryGrid
        stills={stills}
        onOpen={(i) => {
          pushed.current = true;
          show(i, false);
        }}
      />
      {index >= 0 && (
        <Lightbox
          stills={stills}
          index={index}
          onIndexChange={(i) => show(i, true)}
          onClose={close}
          getOrigin={thumbnailBox}
        />
      )}
    </main>
  );
}
