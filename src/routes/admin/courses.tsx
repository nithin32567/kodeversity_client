import { createFileRoute, Outlet } from "@tanstack/react-router";

// This file is the LAYOUT route for /admin/courses.
// It renders an <Outlet /> so nested routes (like /admin/courses/$slug) can mount.
// The actual course list page lives in courses/index.tsx.

export const Route = createFileRoute("/admin/courses")({
  component: function AdminCoursesLayout() {
    return <Outlet />;
  },
});
