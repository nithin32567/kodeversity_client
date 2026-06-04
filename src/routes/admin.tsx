import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/presentation/global/layouts/AdminLayout";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context, location }) => {
    if (location.pathname === "/admin/login") {
      return;
    }
    if (context.auth.isLoading) return;
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/admin/login", search: { redirect: location.href } });
    }
    // Both ADMIN and INSTRUCTOR roles can access the administrative dashboard.
    if (context.auth.user?.role !== "ADMIN" && context.auth.user?.role !== "INSTRUCTOR") {
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});
