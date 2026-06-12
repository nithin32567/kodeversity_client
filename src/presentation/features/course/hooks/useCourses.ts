import { useQuery } from "@tanstack/react-query";
import { courseApi } from "../api";

/** Fetch all courses. Cached for 5 minutes. */
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => courseApi.listCourses(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Fetch a single course by slug. */
export function useCourse(slug: string) {
  return useQuery({
    queryKey: ["courses", slug],
    queryFn: () => courseApi.getCourseBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/** Fetch all lessons for a course. */
export function useCourseLessons(courseSlug: string) {
  return useQuery({
    queryKey: ["courses", courseSlug, "lessons"],
    queryFn: () => courseApi.getLessons(courseSlug),
    enabled: !!courseSlug,
    staleTime: 5 * 60 * 1000,
  });
}
