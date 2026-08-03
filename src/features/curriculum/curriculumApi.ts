/**
 * curriculumApi.ts
 * RTK Query slice powering all curriculum gating/locking operations.
 * Handles: pending unlock requests, approve/reject, and access-override toggle.
 */
import { baseApi } from "@/services/api";
import { endpoints } from "@/infrastructure/http/endpoints";

// ─── Domain Types ─────────────────────────────────────────────────────────────

export type AccessStrategy = "SEQUENTIAL" | "FULL_ACCESS";

export type UnlockRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface UnlockRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  courseIsDeleted?: boolean;
  courseIsSuspended?: boolean;
  moduleId: string;
  moduleName: string;
  /** ID of the instructor assigned to this student/course */
  assignedInstructorId?: string;
  /** Display name of the assigned instructor */
  assignedInstructorName?: string;
  status: UnlockRequestStatus;
  createdAt: string;
}

export interface ModuleLockStatus {
  moduleId: string;
  isLocked: boolean;
  unlockRequestStatus?: UnlockRequestStatus | null;
}

export interface AccessOverridePayload {
  enrollmentId: string;
  strategy: AccessStrategy;
}

// ─── Slice ────────────────────────────────────────────────────────────────────

export const curriculumApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Admin: returns ONLY pending requests (legacy endpoint kept for compat) */
    getPendingUnlockRequests: build.query<UnlockRequest[], void>({
      query: () => ({ url: endpoints.admin.pendingUnlockRequests }),
      providesTags: ["UnlockRequests"],
    }),

    /** Admin: returns ALL requests across the platform (all statuses) */
    getAllUnlockRequests: build.query<UnlockRequest[], void>({
      query: () => ({ url: endpoints.admin.allUnlockRequests }),
      providesTags: ["UnlockRequests"],
    }),

    /** Instructor: returns requests scoped to the authenticated instructor */
    getInstructorUnlockRequests: build.query<UnlockRequest[], void>({
      query: () => ({ url: endpoints.instructor.myUnlockRequests }),
      providesTags: ["UnlockRequests"],
    }),

    approveUnlockRequest: build.mutation<void, string>({
      query: (requestId) => ({
        url: endpoints.admin.approveUnlockRequest(requestId),
        method: "POST",
      }),
      invalidatesTags: ["UnlockRequests"],
    }),

    rejectUnlockRequest: build.mutation<void, string>({
      query: (requestId) => ({
        url: endpoints.admin.rejectUnlockRequest(requestId),
        method: "POST",
      }),
      invalidatesTags: ["UnlockRequests"],
    }),

    /** Generic PATCH — update request status to APPROVED or REJECTED */
    patchUnlockRequest: build.mutation<
      void,
      { requestId: string; status: UnlockRequestStatus }
    >({
      query: ({ requestId, status }) => ({
        url: endpoints.admin.patchUnlockRequest(requestId),
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["UnlockRequests"],
    }),

    deleteUnlockRequest: build.mutation<void, string>({
      query: (requestId) => ({
        url: endpoints.admin.deleteUnlockRequest(requestId),
        method: "DELETE",
      }),
      invalidatesTags: ["UnlockRequests"],
    }),

    setAccessOverride: build.mutation<void, AccessOverridePayload>({
      query: ({ enrollmentId, strategy }) => ({
        url: endpoints.admin.accessOverride(enrollmentId),
        method: "PATCH",
        body: { strategy },
      }),
      invalidatesTags: ["Enrollments"],
    }),

    requestModuleUnlock: build.mutation<
      { status: UnlockRequestStatus },
      { courseId: string; currentModuleId: string; nextModuleId: string }
    >({
      query: (body) => ({
        url: endpoints.progress.requestUnlock(),
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPendingUnlockRequestsQuery,
  useGetAllUnlockRequestsQuery,
  useGetInstructorUnlockRequestsQuery,
  useApproveUnlockRequestMutation,
  useRejectUnlockRequestMutation,
  usePatchUnlockRequestMutation,
  useDeleteUnlockRequestMutation,
  useSetAccessOverrideMutation,
  useRequestModuleUnlockMutation,
} = curriculumApi;
