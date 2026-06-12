/**
 * Course feature module — public API.
 *
 * Import from this barrel to use any course-related component or hook:
 *   import { AllCoursesPage, useCourses } from "@/presentation/features/course";
 */

// Components
export {
  AllCoursesPage,
  CourseDetailPage,
  CourseGridCard,
  CourseCardSkeleton,
  CourseSidebar,
  CourseCurriculum,
  CourseReviews,
  StatBox,
} from "./components";

// Hooks
export { useCourses, useCourse, useCourseLessons } from "./hooks/useCourses";

// Types (re-exported for convenience)
export type {
  Course,
  Lesson,
  Chapter,
  Module,
  Instructor,
  Company,
  Review,
  CourseLevel,
  ChapterType,
} from "./types";

// API layer
export { courseApi } from "./api";
