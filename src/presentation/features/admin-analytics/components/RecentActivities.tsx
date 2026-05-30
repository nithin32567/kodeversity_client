import { UserPlus, BookOpen, Wallet, Star, GraduationCap } from "lucide-react";
import { Panel } from "./Card";

const items = [
  {
    icon: UserPlus,
    grad: "var(--grad-blue)",
    title: "New user registered",
    meta: "Aryan Sharma",
    time: "2m ago",
  },
  {
    icon: BookOpen,
    grad: "var(--grad-purple)",
    title: "New course published",
    meta: "Complete Ethical Hacking",
    time: "15m ago",
  },
  {
    icon: Wallet,
    grad: "var(--grad-green)",
    title: "Payment received",
    meta: "Rs. 1,499 from Priya Verma",
    time: "45m ago",
  },
  {
    icon: Star,
    grad: "var(--grad-yellow)",
    title: "New review added",
    meta: "5 stars on React Developer",
    time: "1h ago",
  },
  {
    icon: GraduationCap,
    grad: "var(--grad-pink)",
    title: "Instructor application",
    meta: "Rahul Kumar applied",
    time: "2h ago",
  },
];

export function RecentActivities() {
  return (
    <Panel
      title="Recent Activities"
      action={
        <a href="#" className="text-xs text-blue-400 hover:text-blue-300">
          View all
        </a>
      }
    >
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.title} className="flex items-start gap-3">
            <div
              className="h-9 w-9 shrink-0 rounded-md grid place-items-center text-white"
              style={{ background: it.grad }}
            >
              <it.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium leading-tight">{it.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">{it.meta}</div>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap pt-0.5">
              {it.time}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
