import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  FolderKanban,
  ClipboardList,
  Award,
  Star,
  Megaphone,
  Video,
  FileText,
  HelpCircle,
  Library,
  Wallet,
  Banknote,
  TicketPercent,
  UserCog,
  ShieldCheck,
  Settings,
  ChevronLeft,
  BadgeCheck,
  Layers,
  PenTool,
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";

type Item = { label: string; icon: React.ComponentType<{ className?: string }>; to?: string };

// ─── Admin navigation groups ─────────────────────────────────────────────────
const adminManage: Item[] = [
  { label: "Courses", icon: BookOpen, to: "/admin/courses" },
  { label: "Students", icon: Users, to: "/admin/students" },
  { label: "Instructors", icon: GraduationCap, to: "/admin/instructors" },
  { label: "Batches", icon: Layers, to: "/admin/batches" },
  { label: "Categories", icon: FolderKanban },
  { label: "Enrollments", icon: ClipboardList },
  { label: "Certificates", icon: Award },
  { label: "Reviews", icon: Star },
  { label: "Announcements", icon: Megaphone },
];
const adminContent: Item[] = [
  { label: "Live Classes", icon: Video, to: "/admin/live-classes" },
  { label: "Assignments", icon: FileText },
  { label: "Quizzes", icon: HelpCircle },
  { label: "Resource Library", icon: Library },
];
const adminFinance: Item[] = [
  { label: "Payments", icon: Wallet },
  { label: "Withdrawals", icon: Banknote },
  { label: "Coupons", icon: TicketPercent },
];
const adminSystem: Item[] = [
  { label: "Users", icon: UserCog },
  { label: "Roles & Permissions", icon: ShieldCheck },
  { label: "Settings", icon: Settings },
];

// ─── Instructor navigation groups ────────────────────────────────────────────
const instructorContent: Item[] = [
  { label: "My Courses", icon: BookOpen, to: "/admin/my-courses" },
  { label: "Course Builder", icon: PenTool, to: "/admin/courses" },
  { label: "My Batches", icon: Layers, to: "/admin/my-batches" },
  { label: "Live Classes", icon: Video, to: "/admin/live-classes" },
];
const instructorTools: Item[] = [
  { label: "Assignments", icon: FileText },
  { label: "Quizzes", icon: HelpCircle },
  { label: "Resource Library", icon: Library },
];

// ─── Shared sub-component ────────────────────────────────────────────────────
function Group({ title, items }: { title: string; items: Item[] }) {
  return (
    <div className="mt-5">
      <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/70 uppercase">
        {title}
      </div>
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it.label}>
            {it.to ? (
              <Link
                to={it.to}
                activeProps={{
                  className:
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white bg-white/[0.08] font-medium transition",
                }}
                inactiveProps={{
                  className:
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground/75 hover:text-foreground hover:bg-white/[0.04] transition",
                }}
              >
                <it.icon className="h-[18px] w-[18px] opacity-80" />
                <span>{it.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground/75 hover:text-foreground hover:bg-white/[0.04] transition opacity-50 cursor-not-allowed"
                title="Coming soon"
              >
                <it.icon className="h-[18px] w-[18px] opacity-80" />
                <span>{it.label}</span>
                <span className="ml-auto text-[9px] font-semibold bg-white/[0.05] border border-[var(--hairline)] px-1.5 py-0.5 rounded-full text-muted-foreground/60">
                  Soon
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function getInitials(email: string, name?: string): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export function Sidebar() {
  const { user } = useAuth();
  const email = user?.email ?? "admin@kodeversity.com";
  const name = user?.name ?? "Admin User";
  const role = user?.role ?? "ADMIN";
  const initials = getInitials(email, name);
  const isInstructor = role === "INSTRUCTOR";

  return (
    <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:max-h-screen w-[248px] shrink-0 border-r border-[var(--hairline)] bg-[var(--surface)]/60 backdrop-blur-sm flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-lg grid place-items-center text-white font-bold"
            style={{ background: "var(--grad-cta)" }}
          >
            K
          </div>
          <span className="text-[17px] font-semibold tracking-tight">Kodeversity</span>
        </div>
        <button className="h-7 w-7 grid place-items-center rounded-md border border-[var(--hairline)] text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-5 pb-2 shrink-0">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${isInstructor
              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${isInstructor ? "bg-purple-400" : "bg-blue-400"}`}
          />
          {isInstructor ? "Instructor Portal" : "Admin Panel"}
        </span>
      </div>

      {/* Navigation */}
      <nav
        data-lenis-prevent="true"
        className="px-2 pb-6 flex-1 min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Dashboard link — shared */}
        <div className="mt-3">
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            activeProps={{
              className:
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white shadow-lg shadow-blue-500/20",
              style: { background: "var(--grad-blue)" },
            }}
            inactiveProps={{
              className:
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground/75 hover:text-foreground hover:bg-white/[0.04] transition",
              style: { background: "none" },
            }}
          >
            <LayoutDashboard className="h-[18px] w-[18px]" />
            <span>Dashboard</span>
          </Link>
        </div>

        {isInstructor ? (
          // ── Instructor navigation ──
          <>
            <Group title="MY WORKSPACE" items={instructorContent} />
            <Group title="TOOLS" items={instructorTools} />
          </>
        ) : (
          // ── Admin navigation ──
          <>
            <Group title="MANAGE" items={adminManage} />
            <Group title="CONTENT & LEARNING" items={adminContent} />
            <Group title="FINANCE" items={adminFinance} />
            <Group title="SYSTEM" items={adminSystem} />
          </>
        )}
      </nav>

      {/* User card */}
      <div className="m-3 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center gap-3 shrink-0">
        <div className="relative">
          <div
            className="h-10 w-10 rounded-full grid place-items-center text-white text-sm font-semibold"
            style={{ background: isInstructor ? "var(--grad-purple)" : "var(--grad-blue)" }}
          >
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[var(--surface-2)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium flex items-center gap-1 truncate">
            <span className="truncate">{name}</span>
            <BadgeCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            {role}
          </div>
        </div>
      </div>
    </aside>
  );
}
