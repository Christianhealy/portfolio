import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteFooter } from "@/components/portfolio/SiteFooter";
import { SiteHeader } from "@/components/portfolio/SiteHeader";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <div className="flex-1 pt-16 sm:pt-20">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
