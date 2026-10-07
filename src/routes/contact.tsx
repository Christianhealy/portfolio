import { createFileRoute, redirect } from "@tanstack/react-router";

// Old link from the previous site; contact details now live on /about.
export const Route = createFileRoute("/contact")({
  beforeLoad: () => {
    throw redirect({ to: "/about", statusCode: 301 });
  },
});
