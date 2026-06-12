import type { Course, Lesson } from "@/domain/course";
import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";

export const courseService = {
  list: (): Promise<Course[]> =>
    apiClient.get<Course[]>(endpoints.course.list, { skipAuthRefresh: true }),

  bySlug: (slug: string): Promise<Course> =>
    apiClient.get<Course>(endpoints.course.bySlug(slug), { skipAuthRefresh: true }),

  lessons: (courseSlug: string): Promise<Lesson[]> =>
    apiClient.get<Lesson[]>(endpoints.course.lessons(courseSlug), { skipAuthRefresh: true }),

  lessonById: (courseSlug: string, lessonId: string): Promise<Lesson> =>
    apiClient.get<Lesson>(endpoints.course.lessonById(courseSlug, lessonId), {
      skipAuthRefresh: true,
    }),
};
