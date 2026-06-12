/**
 * Course module API layer.
 *
 * Thin wrapper that re-exports infrastructure service calls.
 * This is the ONLY file in the course feature that imports from infrastructure/.
 */

import { courseService } from "@/infrastructure/course/courseService";

export const courseApi = {
  /** Fetch all published courses. */
  listCourses: courseService.list,

  /** Fetch a single course by its URL slug. */
  getCourseBySlug: courseService.bySlug,

  /** Fetch lessons for a course by slug. */
  getLessons: courseService.lessons,

  /** Fetch a single lesson by course slug + lesson ID. */
  getLessonById: courseService.lessonById,
};
