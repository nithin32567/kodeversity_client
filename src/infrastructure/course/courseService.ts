import type { Course, Lesson } from "@/domain/course";
import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";

export const courseService = {
  /** Fetch all published courses. */
  list: () => apiClient.get<Course[]>(endpoints.course.list),

  /** Fetch a single course by its slug. */
  bySlug: (slug: string) => apiClient.get<Course>(endpoints.course.bySlug(slug)),

  /** Fetch all lessons for a course. */
  lessons: (courseSlug: string) => apiClient.get<Lesson[]>(endpoints.course.lessons(courseSlug)),

  /** Fetch a single lesson. */
  lessonById: (courseSlug: string, lessonId: string) =>
    apiClient.get<Lesson>(endpoints.course.lessonById(courseSlug, lessonId)),
};
