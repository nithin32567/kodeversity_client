import { createFileRoute, redirect } from "@tanstack/react-router";
import { StudentLayout } from "@/presentation/layouts/StudentLayout";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.isLoading) return;
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: StudentLayout,
});
