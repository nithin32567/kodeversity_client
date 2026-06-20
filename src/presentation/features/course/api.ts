import { courseService } from "@/infrastructure/course/courseService";

export const courseApi = {
  listCourses: courseService.list,

  getCourseBySlug: courseService.bySlug,

  getLessons: courseService.lessons,

  getLessonById: courseService.lessonById,
};
