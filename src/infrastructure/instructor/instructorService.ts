/**
 * instructorService.ts
 * All API calls scoped to the Instructor role.
 * Backend endpoints filter data by the JWT-encoded instructor identity.
 * When dedicated instructor endpoints aren't available yet, we fall back
 * to the shared endpoints and perform client-side filtering.
 */

import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";
import type { Course } from "@/domain/course";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface InstructorBatch {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate?: string | null;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED";
  courseId: string;
  course?: { name: string };
  instructorId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorBatchStudent {
  id: string;
  batchId: string;
  studentId: string;
  joinedAt: string;
  student: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  };
}

export interface CreateCoursePayload {
  title: string;
  slug: string;
  description?: string;
  level?: string;
  price?: number;
  coverImageUrl?: string;
}

export interface CreateModulePayload {
  title: string;
}

export interface CreateChapterPayload {
  title: string;
  type: "VIDEO" | "DOCUMENT" | "QUIZ" | "TEXT" | "PLAYGROUND";
  videoUrl?: string | null;
  duration?: number | null;
  documentUrl?: string | null;
  isPreview?: boolean;
  /**
   * Required when `type === "PLAYGROUND"`.
   * Contains the sandbox template parameters for provisioning.
   */
  playgroundConfig?: {
    pg: string;
    pgname: string;
    playground: string;
    difficulty: "easy" | "medium" | "hard" | "expert";
    maxScore: number;
  } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function unwrap<T>(response: { success?: boolean; data?: T } | T): T {
  if (
    response !== null &&
    typeof response === "object" &&
    "data" in (response as object) &&
    (response as { data?: T }).data !== undefined
  ) {
    return (response as { data?: T }).data as T;
  }
  return response as T;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const instructorService = {
  /**
   * Get courses assigned to / created by the logged-in instructor.
   * Tries the dedicated instructor endpoint first; falls back to the
   * general course list if the endpoint doesn't exist yet.
   */
  getMyCourses: async (): Promise<Course[]> => {
    try {
      const response = await apiClient.get<unknown>(endpoints.instructor.myCourses);
      return unwrap<Course[]>(response as Course[]) ?? [];
    } catch {
      // Fallback: fetch all courses (admin endpoint), return as-is.
      // The page component further filters by instructorId client-side.
      try {
        const response = await apiClient.get<unknown>(endpoints.admin.courses);
        const courses = unwrap<Course[]>(response as Course[]);
        return Array.isArray(courses) ? courses : [];
      } catch {
        return [];
      }
    }
  },

  /**
   * Get batches assigned to the instructor's courses.
   * Falls back to all batches if dedicated endpoint isn't ready.
   */
  getMyBatches: async (): Promise<InstructorBatch[]> => {
    try {
      const response = await apiClient.get<unknown>(endpoints.instructor.myBatches);
      return unwrap<InstructorBatch[]>(response as InstructorBatch[]) ?? [];
    } catch {
      try {
        const response = await apiClient.get<unknown>(endpoints.admin.batches);
        const batches = unwrap<InstructorBatch[]>(response as InstructorBatch[]);
        return Array.isArray(batches) ? batches : [];
      } catch {
        return [];
      }
    }
  },

  /** Get the student roster for a specific batch. */
  getBatchRoster: async (batchId: string): Promise<InstructorBatchStudent[]> => {
    try {
      const response = await apiClient.get<unknown>(endpoints.instructor.batchRoster(batchId));
      return unwrap<InstructorBatchStudent[]>(response as InstructorBatchStudent[]) ?? [];
    } catch {
      return [];
    }
  },

  /** Create a new course (instructor-owned). */
  createCourse: async (payload: CreateCoursePayload): Promise<Course> => {
    const response = await apiClient.post<unknown>(endpoints.instructor.createCourse, payload);
    return unwrap<Course>(response as Course);
  },

  /** Add a module to a course. */
  createModule: async (courseId: string, title: string): Promise<unknown> => {
    const response = await apiClient.post<unknown>(endpoints.instructor.createModule(courseId), {
      title,
    });
    return unwrap(response);
  },

  /** Update a module's title. */
  updateModule: async (moduleId: string, title: string): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(endpoints.instructor.updateModule(moduleId), {
      title,
    });
    return unwrap(response);
  },

  /** Delete a module. */
  deleteModule: async (moduleId: string): Promise<void> => {
    await apiClient.del<unknown>(endpoints.instructor.deleteModule(moduleId));
  },

  /** Add a chapter/lesson to a module. */
  createChapter: async (moduleId: string, data: CreateChapterPayload): Promise<unknown> => {
    const response = await apiClient.post<unknown>(
      endpoints.instructor.createChapter(moduleId),
      data,
    );
    return unwrap(response);
  },

  /** Update a chapter/lesson. */
  updateChapter: async (
    chapterId: string,
    data: Partial<CreateChapterPayload>,
  ): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(
      endpoints.instructor.updateChapter(chapterId),
      data,
    );
    return unwrap(response);
  },

  /** Delete a chapter/lesson. */
  deleteChapter: async (chapterId: string): Promise<void> => {
    await apiClient.del<unknown>(endpoints.instructor.deleteChapter(chapterId));
  },
};
