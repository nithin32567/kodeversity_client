import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { analyticsService, type DashboardAnalytics } from "@/infrastructure/admin/analyticsService";
import { KpiCard } from "@/presentation/features/admin-analytics/components/KpiCard";
import { OverviewAnalytics } from "@/presentation/features/admin-analytics/components/OverviewAnalytics";
import { RecentActivities } from "@/presentation/features/admin-analytics/components/RecentActivities";
import { SystemStatus } from "@/presentation/features/admin-analytics/components/SystemStatus";
import { TopCategories } from "@/presentation/features/admin-analytics/components/TopCategories";
import { EnrollmentsDonut } from "@/presentation/features/admin-analytics/components/EnrollmentsDonut";
import { RevenueBars } from "@/presentation/features/admin-analytics/components/RevenueBars";
import { QuickActions } from "@/presentation/features/admin-analytics/components/QuickActions";
import { TopCoursesTable } from "@/presentation/features/admin-analytics/components/TopCoursesTable";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);

  useEffect(() => {
    analyticsService.getDashboardAnalytics().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-muted-foreground font-mono uppercase tracking-wider text-xs">
        Initializing cluster monitor...
      </div>
    );
  }

  return (
    <main className="px-4 pb-5 sm:px-5 lg:px-6 lg:pb-6 space-y-4 lg:space-y-5 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {data.kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 min-w-0">
          <OverviewAnalytics />
        </div>
        <div className="xl:col-span-4 min-w-0">
          <RecentActivities />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 min-w-0">
          <EnrollmentsDonut />
        </div>
        <div className="xl:col-span-4 min-w-0">
          <RevenueBars />
        </div>
        <div className="xl:col-span-3 min-w-0 space-y-4">
          <SystemStatus />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopCategories />
        <QuickActions />
      </div>

      <TopCoursesTable />
    </main>
  );
}
