import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { pageTransitionTypes } from "./components/motion/pageTransition";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultViewTransition: { types: pageTransitionTypes },
    defaultPreloadStaleTime: 0,
  });

  return router;
};
