import React from "react";
import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";
import type {
  KpiMetric,
  RevenueData,
  EnrollmentDistribution,
  SystemStatusMetric,
  RecentActivity,
  TopCourse,
} from "@/domain/admin-analytics";
import { Users, BookOpen, GraduationCap, Wallet, UserCheck } from "lucide-react";

export interface DashboardAnalytics {
  kpis: KpiMetric[];
  revenueData: RevenueData[];
  enrollmentDistribution: EnrollmentDistribution[];
  systemStatus: SystemStatusMetric[];
  recentActivities: RecentActivity[];
  topCourses: TopCourse[];
}


const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Total Students": Users,
  "Total Courses": BookOpen,
  "Total Instructors": GraduationCap,
  "Total Revenue": Wallet,
  "Active Enrollments": UserCheck,
};

export const analyticsService = {
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    try {
      const data = await apiClient.get<DashboardAnalytics>(endpoints.admin.analytics);
      if (data && Array.isArray(data.kpis)) {
        data.kpis = data.kpis.map((k) => ({
          ...k,
          icon: iconMap[k.label] || Users,
        }));
      }
      return data;
    } catch {
      return {
        kpis: [],
        revenueData: [],
        enrollmentDistribution: [],
        systemStatus: [],
        recentActivities: [],
        topCourses: [],
      };
    }
  },
};
