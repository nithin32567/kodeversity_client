/**
 * useCourses — RTK Query wrappers (replaces TanStack useQuery hooks)
 *
 * These are thin re-exports of the RTK Query auto-generated hooks
 * to preserve the existing import paths used throughout the presentation layer.
 *
 * Components that import from here will work without changes:
 *   import { useCourses, useCourse } from "../hooks/useCourses";
 */
export {
  useGetCoursesQuery as useCourses,
  useGetCourseBySlugQuery as useCourse,
  useGetCourseLessonsQuery as useCourseLessons,
} from "@/features/course/courseApi";
