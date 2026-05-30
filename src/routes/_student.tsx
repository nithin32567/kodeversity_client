import { createFileRoute, redirect } from "@tanstack/react-router";
import { StudentLayout } from "@/presentation/global/layouts/StudentLayout";

export const Route = createFileRoute("/_student")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.isLoading) return;
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    // If the authenticated user is an admin, direct them to their administrative workspace.
    if (context.auth.user?.role === "ADMIN") {
      throw redirect({ to: "/admin" });
    }
  },
  component: StudentLayout,
});
