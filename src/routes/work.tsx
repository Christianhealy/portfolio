import { createFileRoute, redirect } from "@tanstack/react-router";

// Old link from the previous site.
export const Route = createFileRoute("/work")({
  beforeLoad: () => {
    throw redirect({ to: "/stills", statusCode: 301 });
  },
});
