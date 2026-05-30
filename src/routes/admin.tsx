import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/presentation/layouts/AdminLayout";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.isLoading) return;
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    // Only users with ADMIN privileges can proceed into the administration panel.
    if (context.auth.user?.role !== "ADMIN") {
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});
