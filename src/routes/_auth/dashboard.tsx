import { createFileRoute, redirect } from "@tanstack/react-router";
import { authStore } from "@/presentation/features/auth/hooks/authStore";

export const Route = createFileRoute("/_auth/dashboard")({
  beforeLoad: () => {
    const { user } = authStore.get();
    const role = user?.role;

    if (role === "ADMIN") {
      throw redirect({ to: "/admin" });
    } else if (role === "INSTRUCTOR") {
      throw redirect({ to: "/instructor/dashboard" });
    } else {
      throw redirect({ to: "/student/dashboard" });
    }
  },
});
