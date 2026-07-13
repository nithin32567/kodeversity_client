import { apiClient } from "@/infrastructure/http/apiClient";
import { managementService } from "@/infrastructure/admin/managementService";
import { liveClassesService, type LiveSession } from "@/infrastructure/admin/liveClassesService";

const COURSE_URL =
  (import.meta.env.VITE_COURSE_SERVICE_URL as string | undefined) ?? "http://localhost:4001";

export interface StudentEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  purchasedAt: string;
  pricePaid: number;
  completedPercent: number;
  isCompleted: boolean;
}

export interface StudentWithEnrollments {
  id: string;
  name: string | null;
  email: string;
  enrolledCourses: StudentEnrollment[];
}

export const studentService = {
  getStudents: async (): Promise<StudentWithEnrollments[]> => {
    try {
      const response = await apiClient.get<
        { success: boolean; data: StudentWithEnrollments[] } | StudentWithEnrollments[]
      >(`${COURSE_URL}/api/students`);
      if (Array.isArray(response)) {
        return response;
      }
      if (response && typeof response === "object" && "data" in response) {
        return response.data || [];
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch students from course-service:", err);
      return [];
    }
  },

  updateStudent: async (
    studentId: string,
    data: Partial<{ phone: string; highestQualification: string; name: string }>,
  ) => {
    try {
      const response = await apiClient.patch<{ success: boolean; data: unknown }>(
        `${COURSE_URL}/api/students/${studentId}`,
        data,
      );
      if (response && typeof response === "object" && "data" in response) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Failed to update student:", err);
      throw err;
    }
  },

  getStudentEnrollments: async (studentId: string): Promise<StudentEnrollment[]> => {
    const students = await studentService.getStudents();
    const student = students.find((s) => s.id === studentId);
    return student?.enrolledCourses || [];
  },

  getMyBatches: async (studentId: string) => {
    try {
      const allBatches = await managementService.getBatches();
      const myBatches = [];

      for (const batch of allBatches) {
        const roster = await managementService.getBatchRoster(batch.id);
        if (roster.some((r) => r.studentId === studentId)) {
          myBatches.push(batch);
        }
      }
      return myBatches;
    } catch (err) {
      console.error("Failed to get student batches:", err);
      return [];
    }
  },

  getMyLiveClasses: async (studentId: string): Promise<LiveSession[]> => {
    try {
      const myBatches = await studentService.getMyBatches(studentId);
      const meetingsPromises = myBatches.map(async (batch) => {
        const batchMeetings = await liveClassesService.getMeetingsByBatch(batch.id);
        return batchMeetings.map((meeting) => ({
          ...meeting,
          batchName: batch.name,
        }));
      });

      const allMeetingsNested = await Promise.all(meetingsPromises);
      const allMeetings = allMeetingsNested.flat();

      allMeetings.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      return allMeetings;
    } catch (err) {
      console.error("Failed to get live classes for student:", err);
      return [];
    }
  },
};
