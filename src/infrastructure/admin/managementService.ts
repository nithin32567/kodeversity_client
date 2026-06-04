import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";
import type { Course, Instructor } from "@/domain/course";
import type { User } from "@/domain/user";

export interface Batch {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate?: string | null;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED";
  courseId: string;
  course?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BatchStudent {
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

export const managementService = {
  getCourses: async (): Promise<Course[]> => {
    try {
      return await apiClient.get<Course[]>(endpoints.admin.courses);
    } catch {
      return [];
    }
  },
  getUsers: async (): Promise<User[]> => {
    try {
      return await apiClient.get<User[]>(endpoints.admin.users);
    } catch {
      return [];
    }
  },
  createCourse: async (courseData: Partial<Course>): Promise<Course> => {
    return await apiClient.post<Course>(endpoints.admin.courses, courseData);
  },
  createInstructor: async (instructorData: {
    name: string;
    avatarUrl?: string | null;
    designation: string;
    bio: string;
  }): Promise<Instructor> => {
    return await apiClient.post<Instructor>(endpoints.course.createInstructor, instructorData);
  },
  getStudents: async (): Promise<User[]> => {
    try {
      return await apiClient.get<User[]>(endpoints.admin.students);
    } catch {
      return [];
    }
  },
  getInstructors: async (): Promise<Instructor[]> => {
    try {
      return await apiClient.get<Instructor[]>(endpoints.admin.instructors);
    } catch {
      return [];
    }
  },
  getLevels: async (): Promise<string[]> => {
    try {
      return await apiClient.get<string[]>(endpoints.course.levels);
    } catch {
      return ["BEGINNER", "INTERMEDIATE", "ADVANCED", "BEGINNER_TO_ADVANCED"];
    }
  },
  assignInstructor: async (courseId: string, instructorId: string | null): Promise<any> => {
    return await apiClient.patch<any>(endpoints.course.assignInstructor(courseId), {
      instructorId,
    });
  },
  getEnrolledStudents: async (courseId: string): Promise<any[]> => {
    try {
      return await apiClient.get<any[]>(endpoints.course.enrolledStudents(courseId));
    } catch {
      return [];
    }
  },
  createModule: async (courseId: string, title: string): Promise<any> => {
    return await apiClient.post<any>(endpoints.course.createModule(courseId), { title });
  },
  updateModule: async (moduleId: string, title: string): Promise<any> => {
    return await apiClient.patch<any>(endpoints.course.updateModule(moduleId), { title });
  },
  deleteModule: async (moduleId: string): Promise<any> => {
    return await apiClient.del<any>(endpoints.course.deleteModule(moduleId));
  },
  reorderModules: async (
    courseId: string,
    modules: { id: string; sortOrder: number }[],
  ): Promise<any> => {
    return await apiClient.patch<any>(endpoints.course.reorderModules(courseId), { modules });
  },
  createChapter: async (
    moduleId: string,
    chapterData: {
      title: string;
      type: string;
      videoUrl?: string | null;
      duration?: number | null;
      documentUrl?: string | null;
      isPreview?: boolean;
      quizzes?:
        | {
            title: string;
            questions: {
              questionText: string;
              options: string[];
              correctAnswer: string;
            }[];
          }[]
        | null;
    },
  ): Promise<any> => {
    return await apiClient.post<any>(endpoints.course.createChapter(moduleId), chapterData);
  },
  updateChapter: async (chapterId: string, chapterData: any): Promise<any> => {
    return await apiClient.patch<any>(endpoints.course.updateChapter(chapterId), chapterData);
  },
  deleteChapter: async (chapterId: string): Promise<any> => {
    return await apiClient.del<any>(endpoints.course.deleteChapter(chapterId));
  },
  reorderChapters: async (
    moduleId: string,
    chapters: { id: string; sortOrder: number }[],
  ): Promise<any> => {
    return await apiClient.patch<any>(endpoints.course.reorderChapters(moduleId), { chapters });
  },
  getBatches: async (): Promise<Batch[]> => {
    try {
      return await apiClient.get<Batch[]>(endpoints.admin.batches);
    } catch {
      return [];
    }
  },
  createBatch: async (batchData: {
    name: string;
    code: string;
    courseId: string;
    startDate: string;
    endDate?: string | null;
  }): Promise<Batch> => {
    return await apiClient.post<Batch>(
      endpoints.admin.batches,
      batchData,
    );
  },
  addStudentsToBatch: async (batchId: string, studentIds: string[]): Promise<BatchStudent[]> => {
    return await apiClient.post<BatchStudent[]>(
      endpoints.admin.batchStudents(batchId),
      { studentIds },
    );
  },
  getBatchRoster: async (batchId: string): Promise<BatchStudent[]> => {
    try {
      return await apiClient.get<BatchStudent[]>(
        endpoints.admin.batchStudents(batchId),
      );
    } catch {
      return [];
    }
  },
  removeStudentFromBatch: async (batchId: string, studentId: string): Promise<void> => {
    await apiClient.del<any>(endpoints.admin.removeStudentFromBatch(batchId, studentId));
  },
};
