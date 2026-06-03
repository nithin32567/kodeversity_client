import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";
import type { Course, Instructor } from "@/domain/course";
import type { User } from "@/domain/user";

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
};
