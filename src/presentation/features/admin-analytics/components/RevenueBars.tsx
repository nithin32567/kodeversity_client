import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Line,
  ComposedChart,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Panel, MonthPill } from "./Card";

const data = [
  { d: "May 13", v: 3.2 },
  { d: "May 16", v: 4.0 },
  { d: "May 20", v: 4.6 },
  { d: "May 24", v: 3.8 },
  { d: "May 27", v: 4.2 },
  { d: "Jun 01", v: 5.1 },
  { d: "Jun 03", v: 5.4 },
  { d: "Jun 07", v: 4.9 },
  { d: "Jun 10", v: 6.0 },
  { d: "Jun 13", v: 5.8 },
];

export function RevenueBars() {
  return (
    <Panel action={<MonthPill />}>
      <div className="-mt-2 mb-3">
        <h3 className="text-[15px] font-semibold mb-2">Revenue Overview</h3>
        <div className="flex items-baseline gap-3">
          <div className="text-2xl font-bold num">Rs. 24,80,560</div>
        </div>
        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs mt-1">
          <span className="text-muted-foreground">Total Revenue</span>
          <TrendingUp className="h-3 w-3 text-emerald-400 ml-1" />
          <span className="text-emerald-400 font-semibold">22.4%</span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </div>
      <div className="h-[180px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bar-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `Rs. ${v}L`}
              ticks={[0, 2, 4, 6]}
            />
            <Bar dataKey="v" radius={[6, 6, 0, 0]} barSize={18}>
              {data.map((_, i) => (
                <Cell key={i} fill="url(#bar-grad)" />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="v"
              stroke="rgba(168,85,247,0.5)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
