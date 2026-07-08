import { baseApi } from "@/services/api";
import { endpoints } from "@/infrastructure/http/endpoints";
import type { Course, Lesson } from "@/domain/course";

export const courseApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCourses: build.query<Course[], void>({
      query: () => ({ url: endpoints.course.list }),
      providesTags: ["Courses"],
    }),

    getCourseBySlug: build.query<Course, string>({
      query: (slug) => ({ url: endpoints.course.bySlug(slug) }),
      providesTags: (_result, _err, slug) => [{ type: "Course", id: slug }],
    }),

    getCourseLessons: build.query<Lesson[], string>({
      query: (courseSlug) => ({ url: endpoints.course.lessons(courseSlug) }),
      providesTags: (_result, _err, slug) => [{ type: "Course", id: `${slug}-lessons` }],
    }),

    getLessonById: build.query<Lesson, { courseSlug: string; lessonId: string }>({
      query: ({ courseSlug, lessonId }) => ({
        url: endpoints.course.lessonById(courseSlug, lessonId),
      }),
      providesTags: (_result, _err, { lessonId }) => [{ type: "Course", id: `lesson-${lessonId}` }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCoursesQuery,
  useGetCourseBySlugQuery,
  useGetCourseLessonsQuery,
  useGetLessonByIdQuery,
} = courseApi;
