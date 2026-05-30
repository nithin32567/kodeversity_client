import { CheckCircle2 } from "lucide-react";
import { Panel } from "./Card";

const rows = ["Website", "Course Platform", "Payment Gateway", "Email Service", "Live Classes"];

export function SystemStatus() {
  return (
    <Panel
      title="System Status"
      action={
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 whitespace-nowrap">
          <CheckCircle2 className="h-3.5 w-3.5" /> All systems operational
        </span>
      }
    >
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-foreground/85">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              <span className="truncate">{r}</span>
            </span>
            <span className="shrink-0 text-emerald-400 text-xs font-medium">Operational</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
