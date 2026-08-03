import { Panel, MonthPill } from "./Card";
import { AnalyticsChart } from "./AnalyticsChart";
import type { RevenueData } from "@/domain/admin-analytics";

export function OverviewAnalytics({ data = [] }: { data?: RevenueData[] }) {
  const chartData = data.map((d) => ({
    d: d.month,
    students: 0,
    enrollments: 0,
    revenue: d.revenue,
  }));

  return (
    <Panel
      title="Overview Analytics"
      action={
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <Legend dot="#3b82f6" label="Students" />
          <Legend dot="#a855f7" label="Enrollments" />
          <Legend dot="#10b981" label="Revenue" />
          <MonthPill label="This Month" />
        </div>
      }
    >
      <AnalyticsChart data={chartData} />
    </Panel>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
      <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
      {label}
    </span>
  );
}
