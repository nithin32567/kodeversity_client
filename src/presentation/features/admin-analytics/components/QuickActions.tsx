import {
  BookPlus,
  UserPlus,
  GraduationCap,
  Megaphone,
  TicketPercent,
  FileBarChart,
} from "lucide-react";
import { Panel } from "./Card";

const actions = [
  { label: "Add Course", icon: BookPlus, grad: "var(--grad-blue)" },
  { label: "Add Student", icon: UserPlus, grad: "var(--grad-green)" },
  { label: "Add Instructor", icon: GraduationCap, grad: "var(--grad-purple)" },
  { label: "Send Notice", icon: Megaphone, grad: "var(--grad-orange)" },
  { label: "Create Coupon", icon: TicketPercent, grad: "var(--grad-pink)" },
  { label: "Generate Report", icon: FileBarChart, grad: "linear-gradient(135deg,#06b6d4,#3b82f6)" },
];

interface QuickActionsProps {
  onAddStudentClick?: () => void;
  onAddInstructorClick?: () => void;
  onAddCourseClick?: () => void;
}

export function QuickActions({
  onAddStudentClick,
  onAddInstructorClick,
  onAddCourseClick,
}: QuickActionsProps) {
  const getOnClick = (label: string) => {
    if (label === "Add Student") return onAddStudentClick;
    if (label === "Add Instructor") return onAddInstructorClick;
    if (label === "Add Course") return onAddCourseClick;
    return undefined;
  };

  return (
    <Panel title="Quick Actions">
      <div className="grid grid-cols-3 gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={getOnClick(a.label)}
            className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-md bg-[var(--surface-2)] border border-[var(--hairline)] px-2 py-3 text-center hover:bg-white/[0.05] transition cursor-pointer"
          >
            <div
              className="h-10 w-10 rounded-lg grid place-items-center text-white"
              style={{ background: a.grad }}
            >
              <a.icon className="h-5 w-5" />
            </div>
            <span className="text-xs leading-tight text-foreground/85">{a.label}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
