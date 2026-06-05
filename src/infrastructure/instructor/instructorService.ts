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
  type: "VIDEO" | "DOCUMENT" | "QUIZ" | "TEXT";
  videoUrl?: string | null;
  duration?: number | null;
  documentUrl?: string | null;
  isPreview?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function unwrap<T>(response: { success?: boolean; data?: T } | T): T {
  if (
    response !== null &&
    typeof response === "object" &&
    "data" in (response as object) &&
    (response as any).data !== undefined
  ) {
    return (response as any).data as T;
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
      const response = await apiClient.get<any>(endpoints.instructor.myCourses);
      return unwrap<Course[]>(response) ?? [];
    } catch {
      // Fallback: fetch all courses (admin endpoint), return as-is.
      // The page component further filters by instructorId client-side.
      try {
        const response = await apiClient.get<any>(endpoints.admin.courses);
        const courses = unwrap<Course[]>(response);
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
      const response = await apiClient.get<any>(endpoints.instructor.myBatches);
      return unwrap<InstructorBatch[]>(response) ?? [];
    } catch {
      try {
        const response = await apiClient.get<any>(endpoints.admin.batches);
        const batches = unwrap<InstructorBatch[]>(response);
        return Array.isArray(batches) ? batches : [];
      } catch {
        return [];
      }
    }
  },

  /** Get the student roster for a specific batch. */
  getBatchRoster: async (batchId: string): Promise<InstructorBatchStudent[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.instructor.batchRoster(batchId));
      return unwrap<InstructorBatchStudent[]>(response) ?? [];
    } catch {
      return [];
    }
  },

  /** Create a new course (instructor-owned). */
  createCourse: async (payload: CreateCoursePayload): Promise<Course> => {
    const response = await apiClient.post<any>(endpoints.instructor.createCourse, payload);
    return unwrap<Course>(response);
  },

  /** Add a module to a course. */
  createModule: async (courseId: string, title: string): Promise<any> => {
    const response = await apiClient.post<any>(endpoints.instructor.createModule(courseId), {
      title,
    });
    return unwrap(response);
  },

  /** Update a module's title. */
  updateModule: async (moduleId: string, title: string): Promise<any> => {
    const response = await apiClient.patch<any>(endpoints.instructor.updateModule(moduleId), {
      title,
    });
    return unwrap(response);
  },

  /** Delete a module. */
  deleteModule: async (moduleId: string): Promise<void> => {
    await apiClient.del<any>(endpoints.instructor.deleteModule(moduleId));
  },

  /** Add a chapter/lesson to a module. */
  createChapter: async (moduleId: string, data: CreateChapterPayload): Promise<any> => {
    const response = await apiClient.post<any>(endpoints.instructor.createChapter(moduleId), data);
    return unwrap(response);
  },

  /** Update a chapter/lesson. */
  updateChapter: async (chapterId: string, data: Partial<CreateChapterPayload>): Promise<any> => {
    const response = await apiClient.patch<any>(
      endpoints.instructor.updateChapter(chapterId),
      data,
    );
    return unwrap(response);
  },

  /** Delete a chapter/lesson. */
  deleteChapter: async (chapterId: string): Promise<void> => {
    await apiClient.del<any>(endpoints.instructor.deleteChapter(chapterId));
  },
};
