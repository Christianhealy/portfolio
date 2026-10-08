import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/work")({
  beforeLoad: () => {
    throw redirect({ to: "/motion", replace: true });
  },
});
