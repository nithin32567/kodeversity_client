import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Panel, MonthPill } from "./Card";

const data = [
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

type TooltipPayload = {
  value?: number;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] shadow-xl px-3 py-2 text-xs min-w-[150px]">
      <div className="font-semibold mb-1.5">{label?.replace(" 0", " ")}, 2024</div>
      <Row color="#3b82f6" label="Students" value={payload[0]?.value?.toLocaleString()} />
      <Row color="#a855f7" label="Enrollments" value={payload[1]?.value?.toLocaleString()} />
      <Row
        color="#10b981"
        label="Revenue"
        value={`Rs. ${((payload[2]?.value ?? 0) / 1000).toFixed(1)}L`}
      />
    </div>
  );
}

function Row({ color, label, value }: { color: string; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-6 py-0.5">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="font-semibold num">{value}</span>
    </div>
  );
}

export function OverviewAnalytics() {
  return (
    <Panel
      title="Overview Analytics"
      action={
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <Legend dot="#3b82f6" label="Students" />
          <Legend dot="#a855f7" label="Enrollments" />
          <Legend dot="#10b981" label="Revenue" />
          <MonthPill />
        </div>
      }
    >
      <div className="h-[250px] sm:h-[260px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ln-blue" x1="0" x2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="ln-purple" x1="0" x2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="ln-green" x1="0" x2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="d"
              stroke="rgba(255,255,255,0.4)"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              ticks={["May 13", "May 20", "May 27", "Jun 03", "Jun 10", "Jun 13"]}
            />
            <YAxis
              stroke="rgba(255,255,255,0.4)"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(v) => `${v / 1000}K`}
              ticks={[0, 2000, 4000, 6000, 8000]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.25)", strokeDasharray: "4 4" }}
            />
            <ReferenceLine x="Jun 07" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="students"
              stroke="url(#ln-blue)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="enrollments"
              stroke="url(#ln-purple)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#a855f7", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="url(#ln-green)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
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
