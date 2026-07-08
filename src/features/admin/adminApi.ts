import { baseApi } from "@/services/api";
import { endpoints } from "@/infrastructure/http/endpoints";
import type { Course } from "@/domain/course";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
}

interface UpdateUserStatusPayload {
  status: string;
}

interface Batch {
  id: string;
  name: string;
  courseId: string;
  instructorId?: string;
  status: string;
}

interface CreateBatchPayload {
  name: string;
  courseId: string;
}

interface EnrollStudentPayload {
  studentId: string;
  courseId: string;
  batchId?: string;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAnalytics: build.query<unknown, void>({
      query: () => ({ url: endpoints.admin.analytics }),
      providesTags: ["Analytics"],
    }),

    getAdminUsers: build.query<AdminUser[], void>({
      query: () => ({ url: endpoints.admin.users }),
      providesTags: ["Users"],
    }),

    getSuspendedUsers: build.query<AdminUser[], void>({
      query: () => ({ url: endpoints.admin.suspendedUsers }),
      providesTags: [{ type: "Users", id: "suspended" }],
    }),

    createUser: build.mutation<AdminUser, CreateUserPayload>({
      query: (body) => ({
        url: endpoints.admin.createUser,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    updateUser: build.mutation<AdminUser, { id: string } & UpdateUserPayload>({
      query: ({ id, ...body }) => ({
        url: endpoints.admin.updateUser(id),
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    updateUserStatus: build.mutation<AdminUser, { id: string } & UpdateUserStatusPayload>({
      query: ({ id, ...body }) => ({
        url: endpoints.admin.updateUserStatus(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: build.mutation<void, string>({
      query: (id) => ({
        url: endpoints.admin.deleteUser(id),
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    getAdminCourses: build.query<Course[], void>({
      query: () => ({ url: endpoints.admin.courses }),
      providesTags: ["Courses"],
    }),

    getBatches: build.query<Batch[], void>({
      query: () => ({ url: endpoints.admin.batches }),
      providesTags: ["Batches"],
    }),

    createBatch: build.mutation<Batch, CreateBatchPayload>({
      query: (body) => ({
        url: endpoints.admin.batches,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Batches"],
    }),

    updateBatch: build.mutation<Batch, { batchId: string; name?: string }>({
      query: ({ batchId, ...body }) => ({
        url: endpoints.admin.updateBatch(batchId),
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Batches"],
    }),

    deleteBatch: build.mutation<void, string>({
      query: (batchId) => ({
        url: endpoints.admin.deleteBatch(batchId),
        method: "DELETE",
      }),
      invalidatesTags: ["Batches"],
    }),

    assignInstructorToBatch: build.mutation<void, { batchId: string; instructorId: string }>({
      query: ({ batchId, ...body }) => ({
        url: endpoints.admin.assignInstructorBatch(batchId),
        method: "POST",
        body,
      }),
      invalidatesTags: ["Batches"],
    }),

    // ── Enrollments ──────────────────────────────────────────────────────────
    enrollStudent: build.mutation<void, EnrollStudentPayload>({
      query: (body) => ({
        url: endpoints.admin.enrollStudent,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Enrollments"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAnalyticsQuery,
  useGetAdminUsersQuery,
  useGetSuspendedUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetAdminCoursesQuery,
  useGetBatchesQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
  useAssignInstructorToBatchMutation,
  useEnrollStudentMutation,
} = adminApi;
