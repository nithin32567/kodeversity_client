/**
 * useAnalyticsData — RTK Query migration
 * Replaces: useQuery from @tanstack/react-query
 * Uses: useGetAnalyticsQuery from features/admin/adminApi
 */
import { useState } from "react";
import { useGetAnalyticsQuery } from "@/features/admin/adminApi";
import type { DashboardAnalytics } from "@/infrastructure/admin/analyticsService";

export interface TimelineDataPoint {
  d: string;
  students: number;
  enrollments: number;
  revenue: number;
  details?: number;
}

const mockTimelineData: TimelineDataPoint[] = [
  { d: "May 13", students: 3200, enrollments: 2100, revenue: 900 },
  { d: "May 16", students: 3800, enrollments: 2400, revenue: 1100 },
  { d: "May 20", students: 4600, enrollments: 2900, revenue: 1500 },
  { d: "May 24", students: 5400, enrollments: 3300, revenue: 1900 },
  { d: "May 27", students: 5200, enrollments: 3200, revenue: 1800 },
  { d: "Jun 01", students: 5900, enrollments: 3700, revenue: 2200 },
  { d: "Jun 03", students: 6100, enrollments: 3900, revenue: 2400 },
  { d: "Jun 07", students: 6250, enrollments: 4150, revenue: 2500 },
  { d: "Jun 10", students: 6900, enrollments: 4400, revenue: 2750 },
  { d: "Jun 13", details: 1, students: 7300, enrollments: 4600, revenue: 2900 },
];

export function useAnalyticsData() {
  const [selectedMonth, setSelectedMonth] = useState("This Month");

  const { data: dashboardData, isLoading, isError } = useGetAnalyticsQuery();

  return {
    isLoading,
    isError,
    dashboardData: dashboardData as DashboardAnalytics | undefined,
    timelineData: mockTimelineData,
    selectedMonth,
    setSelectedMonth,
  };
}
