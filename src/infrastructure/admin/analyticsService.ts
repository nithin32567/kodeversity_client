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

const mockKpis: KpiMetric[] = [
  {
    label: "Total Students",
    value: "12.5K",
    delta: "18.6%",
    icon: Users,
    gradient: "var(--grad-blue)",
    sparkColor: "#3b82f6",
    sparkColor2: "#06b6d4",
    series: [10, 14, 12, 18, 16, 22, 20, 28, 26, 34, 32, 40],
  },
  {
    label: "Total Courses",
    value: "134",
    delta: "14.3%",
    icon: BookOpen,
    gradient: "var(--grad-purple)",
    sparkColor: "#a855f7",
    sparkColor2: "#ec4899",
    series: [8, 10, 9, 12, 14, 13, 18, 16, 22, 24, 26, 30],
  },
  {
    label: "Total Instructors",
    value: "87",
    delta: "9.8%",
    icon: GraduationCap,
    gradient: "var(--grad-green)",
    sparkColor: "#10b981",
    sparkColor2: "#34d399",
    series: [5, 8, 7, 10, 12, 11, 14, 16, 15, 18, 20, 22],
  },
  {
    label: "Total Revenue",
    value: "Rs.24.8L",
    delta: "22.4%",
    icon: Wallet,
    gradient: "var(--grad-orange)",
    sparkColor: "#f59e0b",
    sparkColor2: "#f97316",
    series: [6, 8, 7, 10, 14, 12, 18, 22, 20, 26, 28, 34],
  },
  {
    label: "Active Enrollments",
    value: "8.9K",
    delta: "16.2%",
    icon: UserCheck,
    gradient: "var(--grad-pink)",
    sparkColor: "#ec4899",
    sparkColor2: "#f43f5e",
    series: [9, 12, 11, 14, 13, 17, 16, 20, 22, 26, 30, 34],
  },
];

const mockRevenueData: RevenueData[] = [
  { month: "Jan", revenue: 4000, expenses: 2400 },
  { month: "Feb", revenue: 3000, expenses: 1398 },
  { month: "Mar", revenue: 9800, expenses: 2000 },
  { month: "Apr", revenue: 3908, expenses: 2780 },
  { month: "May", revenue: 4800, expenses: 1890 },
  { month: "Jun", revenue: 3800, expenses: 2390 },
  { month: "Jul", revenue: 4300, expenses: 3490 },
];

const mockEnrollmentDistribution: EnrollmentDistribution[] = [
  { name: "DevOps & Cloud", value: 400, color: "#3b82f6" },
  { name: "Fullstack Web", value: 300, color: "#10b981" },
  { name: "AI & Data Science", value: 200, color: "#a855f7" },
  { name: "Cybersecurity", value: 100, color: "#f59e0b" },
];

const mockSystemStatus: SystemStatusMetric[] = [
  { name: "API Gateway", status: "healthy", value: "99.9%" },
  { name: "Database Service", status: "healthy", value: "100%" },
  { name: "Auth Service", status: "healthy", value: "99.9%" },
];

const mockRecentActivities: RecentActivity[] = [
  {
    id: "1",
    user: { name: "Aarav Mehta", initials: "AM" },
    action: "enrolled in",
    target: "Kubernetes Masterclass",
    time: "2 mins ago",
  },
  {
    id: "2",
    user: { name: "Ananya Iyer", initials: "AI" },
    action: "completed quiz in",
    target: "Docker Fundamentals",
    time: "15 mins ago",
  },
  {
    id: "3",
    user: { name: "Kabir Dev", initials: "KD" },
    action: "submitted assignment for",
    target: "Terraform Infrastructure",
    time: "1 hr ago",
  },
];

const mockTopCourses: TopCourse[] = [
  {
    id: "1",
    name: "DevOps & Kubernetes Bootcamp",
    instructor: "Nithin Kumar",
    sales: 1240,
    revenue: "Rs.4.9L",
    rating: 4.8,
  },
  {
    id: "2",
    name: "React & Next.js Advanced Suite",
    instructor: "Rohit Sharma",
    sales: 980,
    revenue: "Rs.3.2L",
    rating: 4.9,
  },
  {
    id: "3",
    name: "AWS Solutions Architect Core",
    instructor: "Nithin Kumar",
    sales: 850,
    revenue: "Rs.2.5L",
    rating: 4.7,
  },
];

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
        kpis: mockKpis,
        revenueData: mockRevenueData,
        enrollmentDistribution: mockEnrollmentDistribution,
        systemStatus: mockSystemStatus,
        recentActivities: mockRecentActivities,
        topCourses: mockTopCourses,
      };
    }
  },
};
