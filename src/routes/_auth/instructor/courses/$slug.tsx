import { createFileRoute } from "@tanstack/react-router";
import { CourseManagementDashboard } from "@/presentation/features/admin-courses/components/CourseManagementDashboard";

export const Route = createFileRoute("/_auth/instructor/courses/$slug")({
  loader: ({ params }) => ({ slug: params.slug }),
  head: () => ({ meta: [{ title: "Course Content Builder — Kodeversity" }] }),
  component: function Page() {
    const { slug } = Route.useLoaderData();
    return <CourseManagementDashboard slug={slug} />;
  },
});
