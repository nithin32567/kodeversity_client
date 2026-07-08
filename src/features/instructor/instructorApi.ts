import { baseApi } from "@/services/api";
import { endpoints } from "@/infrastructure/http/endpoints";
import type { Course } from "@/domain/course";

interface Batch {
  id: string;
  name: string;
  courseId: string;
  status: string;
}

interface Meeting {
  id: string;
  title: string;
  batchId: string;
  scheduledAt: string;
  status: string;
}

interface CreateCoursePayload {
  title: string;
  description: string;
  level?: string;
}

interface CreateModulePayload {
  title: string;
  description?: string;
  order?: number;
}

interface CreateChapterPayload {
  title: string;
  content?: string;
  type?: string;
  order?: number;
}

interface CreateMeetingPayload {
  title: string;
  batchId: string;
  scheduledAt: string;
}

export const instructorApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInstructorCourses: build.query<Course[], void>({
      query: () => ({ url: endpoints.instructor.myCourses }),
      providesTags: ["Courses"],
    }),

    createCourse: build.mutation<Course, CreateCoursePayload>({
      query: (body) => ({
        url: endpoints.instructor.createCourse,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),

    getInstructorBatches: build.query<Batch[], void>({
      query: () => ({ url: endpoints.instructor.myBatches }),
      providesTags: ["Batches"],
    }),

    getBatchRoster: build.query<unknown[], string>({
      query: (batchId) => ({ url: endpoints.instructor.batchRoster(batchId) }),
      providesTags: (_r, _e, batchId) => [{ type: "Batches", id: `${batchId}-roster` }],
    }),

    createModule: build.mutation<unknown, { courseId: string } & CreateModulePayload>({
      query: ({ courseId, ...body }) => ({
        url: endpoints.instructor.createModule(courseId),
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { courseId }) => [{ type: "Course", id: courseId }],
    }),

    updateModule: build.mutation<unknown, { moduleId: string } & Partial<CreateModulePayload>>({
      query: ({ moduleId, ...body }) => ({
        url: endpoints.instructor.updateModule(moduleId),
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),

    deleteModule: build.mutation<void, string>({
      query: (moduleId) => ({
        url: endpoints.instructor.deleteModule(moduleId),
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),

    createChapter: build.mutation<unknown, { moduleId: string } & CreateChapterPayload>({
      query: ({ moduleId, ...body }) => ({
        url: endpoints.instructor.createChapter(moduleId),
        method: "POST",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),

    updateChapter: build.mutation<unknown, { chapterId: string } & Partial<CreateChapterPayload>>({
      query: ({ chapterId, ...body }) => ({
        url: endpoints.instructor.updateChapter(chapterId),
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),

    deleteChapter: build.mutation<void, string>({
      query: (chapterId) => ({
        url: endpoints.instructor.deleteChapter(chapterId),
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),

    getMeetings: build.query<Meeting[], void>({
      query: () => ({ url: endpoints.instructor.meetings }),
      providesTags: ["Meetings"],
    }),

    getMeetingsByBatch: build.query<Meeting[], string>({
      query: (batchId) => ({
        url: endpoints.instructor.meetingsByBatch(batchId),
      }),
      providesTags: (_r, _e, batchId) => [{ type: "Meetings", id: batchId }],
    }),

    createMeeting: build.mutation<Meeting, CreateMeetingPayload>({
      query: (body) => ({
        url: endpoints.instructor.meetings,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Meetings"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInstructorCoursesQuery,
  useCreateCourseMutation,
  useGetInstructorBatchesQuery,
  useGetBatchRosterQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
  useGetMeetingsQuery,
  useGetMeetingsByBatchQuery,
  useCreateMeetingMutation,
} = instructorApi;
