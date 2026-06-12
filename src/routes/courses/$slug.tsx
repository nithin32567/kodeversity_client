import { createFileRoute } from "@tanstack/react-router";
import { CourseDetailPage } from "@/presentation/features/course";

export const Route = createFileRoute("/courses/$slug")({
  loader: ({ params }) => ({ slug: params.slug }),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.slug ? "Course Detail" : "Course"} — Kodeversity` },
      { name: "description", content: "Course details on Kodeversity." },
    ],
  }),
  component: CourseDetailRoute,
});

function CourseDetailRoute() {
  const { slug } = Route.useLoaderData();
  return <CourseDetailPage slug={slug} />;
}
