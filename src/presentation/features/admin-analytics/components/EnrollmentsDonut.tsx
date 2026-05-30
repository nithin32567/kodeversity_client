import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Panel } from "./Card";

const data = [
  { name: "Web Development", value: 3742, pct: "41.9%", color: "#3b82f6" },
  { name: "Ethical Hacking", value: 1876, pct: "21.0%", color: "#a855f7" },
  { name: "Digital Marketing", value: 1432, pct: "16.0%", color: "#facc15" },
  { name: "Data Science", value: 1128, pct: "12.6%", color: "#10b981" },
  { name: "Design", value: 764, pct: "8.5%", color: "#ec4899" },
];

export function EnrollmentsDonut() {
  return (
    <Panel title="Enrollments Overview">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative h-[170px] w-[170px] shrink-0 sm:h-[180px] sm:w-[180px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                innerRadius={58}
                outerRadius={82}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-2xl font-bold num">8,942</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
        <ul className="w-full flex-1 space-y-2">
          {data.map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-foreground/85">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                <span className="truncate">{d.name}</span>
              </span>
              <span className="shrink-0 text-muted-foreground num text-xs">
                {d.value.toLocaleString()} ({d.pct})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
