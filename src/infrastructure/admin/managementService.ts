import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";
import type { Course } from "@/domain/course";
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
};
