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
} from "lucide-react";

type Item = { label: string; icon: React.ComponentType<{ className?: string }>; to?: string };

const manage: Item[] = [
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
const content: Item[] = [
  { label: "Live Classes", icon: Video, to: "/admin/live-classes" },
  { label: "Assignments", icon: FileText },
  { label: "Quizzes", icon: HelpCircle },
  { label: "Resource Library", icon: Library },
];
const finance: Item[] = [
  { label: "Payments", icon: Wallet },
  { label: "Withdrawals", icon: Banknote },
  { label: "Coupons", icon: TicketPercent },
];
const system: Item[] = [
  { label: "Users", icon: UserCog },
  { label: "Roles & Permissions", icon: ShieldCheck },
  { label: "Settings", icon: Settings },
];

function Group({ title, items }: { title: string; items: Item[] }) {
  return (
    <div className="mt-5">
      <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/70">
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
                    "flex items-center  gap-3 px-3 py-2 rounded-md text-sm text-white bg-white/[0.08] font-medium transition",
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
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground/75 hover:text-foreground hover:bg-white/[0.04] transition"
              >
                <it.icon className="h-[18px] w-[18px] opacity-80" />
                <span>{it.label}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useAuth } from "@/presentation/features/auth/hooks/useAuth";

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

export function Sidebar() {
  const { user } = useAuth();
  const email = user?.email ?? "admin@kodeversity.com";
  const name = user?.name ?? "Admin User";
  const role = user?.role ?? "ADMIN";
  const initials = getInitials(email, name);

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
      <nav
        data-lenis-prevent="true"
        className="px-2 pb-6 flex-1 min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Dashboard active */}
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

        <Group title="MANAGE" items={manage} />
        <Group title="CONTENT & LEARNING" items={content} />
        <Group title="FINANCE" items={finance} />
        <Group title="SYSTEM" items={system} />
      </nav>

      {/* User card */}
      <div className="m-3 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center gap-3 shrink-0">
        <div className="relative">
          <div
            className="h-10 w-10 rounded-full grid place-items-center text-white text-sm font-semibold"
            style={{ background: "var(--grad-purple)" }}
          >
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[var(--surface-2)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium flex items-center gap-1">
            {name}
            <BadgeCheck className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-xs text-muted-foreground uppercase">{role}</div>
        </div>
      </div>
    </aside>
  );
}
