import { baseApi } from "@/services/api";
import { endpoints } from "@/infrastructure/http/endpoints";
import type { Course, Lesson } from "@/domain/course";

export interface LessonProgressRecord {
  lessonId: string;
  watchTime: number;
  percentage: number;
  isCompleted: boolean;
}

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

    getCourseContent: build.query<unknown, string>({
      query: (courseId) => ({ url: endpoints.course.content(courseId) }),
      providesTags: (_result, _err, courseId) => [{ type: "Course", id: `content-${courseId}` }],
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

    getChapterVideo: build.query<{ success: boolean; videoUrl: string }, string>({
      query: (chapterId) => ({ url: endpoints.course.fetchChapterVideo(chapterId) }),
    }),

    /** POST /api/v1/lessons/:id/progress — upserts watch progress for a lesson */
    updateLessonProgress: build.mutation<
      { success: boolean; data: LessonProgressRecord },
      { lessonId: string; percentage: number; watchTime: number; courseId: string }
    >({
      query: ({ lessonId, percentage, watchTime, courseId }) => ({
        url: endpoints.course.updateLessonProgress(lessonId),
        method: "POST",
        body: { percentage, watchTime, courseId },
      }),
    }),

    /** GET /api/v1/courses/:courseId/my-progress — fetches all lesson progress for a course */
    getMyCourseProgress: build.query<
      { success: boolean; data: LessonProgressRecord[] },
      string
    >({
      query: (courseId) => ({ url: endpoints.course.myCourseProgress(courseId) }),
      providesTags: (_result, _err, courseId) => [{ type: "Progress", id: courseId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCoursesQuery,
  useGetCourseBySlugQuery,
  useGetCourseLessonsQuery,
  useGetLessonByIdQuery,
  useGetChapterVideoQuery,
  useGetCourseContentQuery,
  useUpdateLessonProgressMutation,
  useGetMyCourseProgressQuery,
} = courseApi;
