import type { ComponentType } from "react";

export interface KpiMetric {
  label: string;
  value: string;
  delta: string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
  sparkColor: string;
  sparkColor2: string;
  series: number[];
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface EnrollmentDistribution {
  name: string;
  value: number;
  color: string;
}

export interface SystemStatusMetric {
  name: string;
  status: "healthy" | "warning" | "error";
  value: string;
}

export interface RecentActivity {
  id: string;
  user: {
    name: string;
    avatarUrl?: string;
    initials: string;
  };
  action: string;
  target: string;
  time: string;
}

export interface TopCourse {
  id: string;
  name: string;
  instructor: string;
  sales: number;
  revenue: string;
  rating: number;
}
