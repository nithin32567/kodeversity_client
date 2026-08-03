import { UserPlus, BookOpen, Wallet, Star, GraduationCap } from "lucide-react";
import { Panel } from "./Card";

import type { RecentActivity } from "@/domain/admin-analytics";
import { Activity } from "lucide-react";

const getIconForAction = (action: string) => {
  const lower = action.toLowerCase();
  if (lower.includes("registered")) return { icon: UserPlus, grad: "var(--grad-blue)" };
  if (lower.includes("published") || lower.includes("enrolled")) return { icon: BookOpen, grad: "var(--grad-purple)" };
  if (lower.includes("payment") || lower.includes("paid")) return { icon: Wallet, grad: "var(--grad-green)" };
  if (lower.includes("review")) return { icon: Star, grad: "var(--grad-yellow)" };
  if (lower.includes("instructor") || lower.includes("quiz")) return { icon: GraduationCap, grad: "var(--grad-pink)" };
  return { icon: Activity, grad: "var(--grad-blue)" };
};

export function RecentActivities({ activities = [] }: { activities?: RecentActivity[] }) {
  if (!activities.length) return null;

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
        {activities.map((it) => {
          const { icon: Icon, grad } = getIconForAction(it.action);
          return (
            <li key={it.id} className="flex items-start gap-3">
              <div
                className="h-9 w-9 shrink-0 rounded-md grid place-items-center text-white"
                style={{ background: grad }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight capitalize">{it.action} {it.target}</div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">{it.user.name}</div>
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap pt-0.5">
                {it.time}
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
