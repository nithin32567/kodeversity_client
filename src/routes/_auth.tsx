import { createFileRoute, redirect } from "@tanstack/react-router";
import { authStore } from "@/presentation/features/auth/hooks/authStore";
import { PortalLayout } from "@/presentation/global/layouts/PortalLayout";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/login" || location.pathname === "/admin/login") {
      return;
    }

    const { isAuthenticated, isLoading, user } = authStore.get();

    if (isLoading) return;

    if (!isAuthenticated) {
      if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/instructor")) {
        throw redirect({ to: "/admin/login", search: { redirect: location.href } });
      }
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }

    const role = user?.role;

    if (location.pathname.startsWith("/admin")) {
      if (role !== "ADMIN") {
        if (role === "INSTRUCTOR") {
          throw redirect({ to: "/instructor/dashboard" });
        } else {
          throw redirect({ to: "/student/dashboard" });
        }
      }
    } else if (location.pathname.startsWith("/instructor")) {
      if (role !== "INSTRUCTOR" && role !== "ADMIN") {
        throw redirect({ to: "/student/dashboard" });
      }
    } else if (location.pathname.startsWith("/student")) {
      if (role !== "STUDENT" && role !== "ADMIN") {
        if (role === "INSTRUCTOR") {
          throw redirect({ to: "/instructor/dashboard" });
        } else {
          throw redirect({ to: "/admin" });
        }
      }
    }
  },
  component: PortalLayout,
});
