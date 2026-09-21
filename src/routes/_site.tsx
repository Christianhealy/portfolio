import { Outlet } from "@tanstack/react-router";
import { SiteChrome } from "@/components/portfolio/SiteChrome";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <SiteChrome>
      <Outlet />
    </SiteChrome>
  );
}
