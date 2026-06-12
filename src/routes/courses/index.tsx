import { createFileRoute, redirect } from "@tanstack/react-router";
import { authStore } from "@/presentation/features/auth/hooks/authStore";
import { AllCoursesPage } from "@/presentation/features/course";

export const Route = createFileRoute("/courses/")({
  beforeLoad: () => {
    const { isAuthenticated, user } = authStore.get();
    if (isAuthenticated && user?.role === "STUDENT") {
      throw redirect({ to: "/student/courses" });
    }
  },
  head: () => ({
    meta: [
      { title: "All Courses — Kodeversity" },
      {
        name: "description",
        content: "Choose from 200+ industry-focused courses and start your learning journey.",
      },
    ],
  }),
  component: AllCoursesPage,
});
