import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { authStore, type AuthSnapshot } from "@/presentation/contexts/authStore";

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthSnapshot;
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient, auth: authStore.get() },
    scrollRestoration: true,
    getScrollRestorationKey: (location) => location.pathname,
  });

  authStore.subscribe((snapshot) => {
    router.update({ context: { queryClient, auth: snapshot } });
    router.invalidate();
  });

  return router;
};
