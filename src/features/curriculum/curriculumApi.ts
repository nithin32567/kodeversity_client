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
  moduleId: string;
  moduleName: string;
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
    getPendingUnlockRequests: build.query<UnlockRequest[], void>({
      query: () => ({ url: endpoints.admin.pendingUnlockRequests }),
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
      { courseSlug: string; moduleId: string }
    >({
      query: ({ courseSlug, moduleId }) => ({
        url: endpoints.progress.requestUnlock(courseSlug, moduleId),
        method: "POST",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPendingUnlockRequestsQuery,
  useApproveUnlockRequestMutation,
  useRejectUnlockRequestMutation,
  useSetAccessOverrideMutation,
  useRequestModuleUnlockMutation,
} = curriculumApi;
