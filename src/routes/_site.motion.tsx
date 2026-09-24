import { createFileRoute } from "@tanstack/react-router";
import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";

export const Route = createFileRoute("/_site/motion")({
  head: () => ({
    meta: [
      { title: "Motion — Christian Healy" },
      { name: "description", content: "Selected films and cinematography by Christian Healy." },
      { property: "og:title", content: "Motion — Christian Healy" },
      {
        property: "og:description",
        content: "Selected films and cinematography by Christian Healy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  return (
    <main>
      <h1 className="sr-only">Motion</h1>
      <PortfolioGallery mediaType="video" />
    </main>
  );
}
