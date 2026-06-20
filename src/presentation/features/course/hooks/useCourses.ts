import { useQuery } from "@tanstack/react-query";
import { courseApi } from "../api";

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => courseApi.listCourses(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ["courses", slug],
    queryFn: () => courseApi.getCourseBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCourseLessons(courseSlug: string) {
  return useQuery({
    queryKey: ["courses", courseSlug, "lessons"],
    queryFn: () => courseApi.getLessons(courseSlug),
    enabled: !!courseSlug,
    staleTime: 5 * 60 * 1000,
  });
}
