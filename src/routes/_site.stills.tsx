import { createFileRoute } from "@tanstack/react-router";
import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";

export const Route = createFileRoute("/_site/stills")({
  head: () => ({
    meta: [
      { title: "Stills — Christian Healy" },
      { name: "description", content: "Selected photography by Christian Healy." },
      { property: "og:title", content: "Stills — Christian Healy" },
      { property: "og:description", content: "Selected photography by Christian Healy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  return (
    <main>
      <h1 className="sr-only">Stills</h1>
      <PortfolioGallery mediaType="image" />
    </main>
  );
}
