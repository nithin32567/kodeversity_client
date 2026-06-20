import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/admin/courses")({
  component: function AdminCoursesLayout() {
    return <Outlet />;
  },
});
