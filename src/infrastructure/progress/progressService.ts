import type { CourseProgress, Certificate } from "@/domain/progress";
import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";

export const progressService = {
  /** Get the user's progress for a specific course. */
  getCourseProgress: (courseSlug: string) =>
    apiClient.get<CourseProgress>(endpoints.progress.get(courseSlug)),

  /** Mark a lesson as completed. */
  markLessonComplete: (courseSlug: string, lessonId: string) =>
    apiClient.post<CourseProgress>(endpoints.progress.markComplete(courseSlug, lessonId)),

  /** Get all earned certificates. */
  getCertificates: () => apiClient.get<Certificate[]>(endpoints.progress.certificates),
};
