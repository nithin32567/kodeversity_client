/* eslint-disable react-refresh/only-export-components */
import { Link, NavLink, useNavigate } from "react-router-dom";
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
  LogOut,
  Sparkles,
  ShieldOff,
  Terminal,
  Archive,
  Inbox,
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";

export type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to?: string;
};

export const adminManage: NavItem[] = [
  { label: "Courses", icon: BookOpen, to: "/admin/courses" },
  { label: "Playgrounds", icon: Terminal, to: "/admin/playground" },
  { label: "Students", icon: Users, to: "/admin/students" },
  { label: "Instructors", icon: GraduationCap, to: "/admin/instructors" },
  { label: "Batches", icon: Layers, to: "/admin/batches" },
  { label: "Unlock Requests", icon: Inbox, to: "/admin/unlock-requests" },
  { label: "Categories", icon: FolderKanban },
  { label: "Enrollments", icon: ClipboardList, to: "/admin/enrollments" },
  { label: "Certificates", icon: Award },
  { label: "Reviews", icon: Star },
  { label: "Announcements", icon: Megaphone },
];
export const adminContent: NavItem[] = [
  { label: "Live Classes", icon: Video, to: "/admin/live-classes" },
  { label: "Assignments", icon: FileText },
  { label: "Quizzes", icon: HelpCircle },
  { label: "Resource Library", icon: Library },
];
export const adminFinance: NavItem[] = [
  { label: "Payments", icon: Wallet },
  { label: "Withdrawals", icon: Banknote },
  { label: "Coupons", icon: TicketPercent },
];
export const adminSystem: NavItem[] = [
  { label: "Users", icon: UserCog },
  { label: "Inactive Users", icon: ShieldOff, to: "/admin/inactive-users" },
  { label: "Inactive Courses", icon: Archive, to: "/admin/archive" },
  { label: "Roles & Permissions", icon: ShieldCheck },
  { label: "Settings", icon: Settings },
];

export const instructorContent: NavItem[] = [
  { label: "My Courses", icon: BookOpen, to: "/instructor/courses" },
  { label: "My Batches", icon: Layers, to: "/instructor/batches" },
  { label: "Live Classes", icon: Video, to: "/instructor/meetings" },
  { label: "Unlock Requests", icon: Inbox, to: "/instructor/unlock-requests" },
];
export const instructorTools: NavItem[] = [
  { label: "Assignments", icon: FileText },
  { label: "Quizzes", icon: HelpCircle },
  { label: "Resource Library", icon: Library },
];

export const studentWorkspace: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/student/dashboard" },
  // { label: "All Courses", icon: BookOpen, to: "/student/courses" },  
  { label: "My Batches", icon: Layers, to: "/student/batches" },
  { label: "Live Classes", icon: Video, to: "/student/live-classes" },
  { label: "Profile", icon: UserCog, to: "/student/profile" },
];
export const studentSandbox: NavItem[] = [
  { label: "Challenges", icon: PenTool, to: "/student/challenges" },
  { label: "Certificates", icon: Award, to: "/student/certificates" },
  { label: "Settings", icon: Settings, to: "/student/settings" },
];

function Group({
  title,
  items,
  onClose,
}: {
  title: string;
  items: NavItem[];
  onClose?: () => void;
}) {
  return (
    <div className="mt-5">
      <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/70 uppercase">
        {title}
      </div>
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it.label}>
            {it.to ? (
              <NavLink
                to={it.to}
                onClick={onClose}
                className={({ isActive }) =>
                  isActive
                    ? "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white font-medium transition border-l-2 border-indigo-500 bg-white/[0.08]"
                    : "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground/75 hover:text-foreground hover:bg-white/[0.04] transition border-l-2 border-transparent"
                }
              >
                <it.icon className="h-[18px] w-[18px] opacity-80" />
                <span>{it.label}</span>
              </NavLink>
            ) : (
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground/75 hover:text-foreground hover:bg-white/[0.04] transition border-l-2 border-transparent opacity-50 cursor-not-allowed text-left"
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

function StudentGroup({
  title,
  items,
  onClose,
}: {
  title: string;
  items: NavItem[];
  onClose?: () => void;
}) {
  return (
    <div className="mt-5 lg:mt-5 px-2 lg:px-0">
      <div className="px-3 lg:px-1 mb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/70 uppercase lg:text-center">
        {title}
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((it) => (
          <div key={it.label}>
            {it.to ? (
              <NavLink
                to={it.to}
                onClick={onClose}
                end
                className={({ isActive }) =>
                  `flex lg:flex-col items-center gap-3 lg:gap-1 rounded-lg lg:rounded-xl px-3 lg:px-1 py-2.5 lg:py-2 text-sm lg:text-[10px] font-medium transition-colors hover:bg-foreground/[0.04] hover:text-foreground ${
                    isActive
                      ? "bg-primary-soft text-foreground ring-1 ring-primary/40"
                      : "text-muted-foreground"
                  }`
                }
              >
                <it.icon className="h-[18px] w-[18px] lg:h-5 lg:w-5 shrink-0" />
                <span className="leading-tight lg:text-center">{it.label}</span>
              </NavLink>
            ) : (
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="w-full flex lg:flex-col items-center gap-3 lg:gap-1 rounded-lg lg:rounded-xl px-3 lg:px-1 py-2.5 lg:py-2 text-sm lg:text-[10px] font-medium text-muted-foreground transition-colors opacity-50 cursor-not-allowed text-left"
                title="Coming soon"
              >
                <it.icon className="h-[18px] w-[18px] lg:h-5 lg:w-5 shrink-0" />
                <span className="leading-tight lg:text-center">{it.label}</span>
                <span className="ml-auto lg:ml-0 lg:mt-0.5 text-[8px] font-semibold bg-white/[0.05] border border-[var(--hairline)] px-1.5 py-0.5 rounded-full text-muted-foreground/60">
                  Soon
                </span>
              </button>
            )}
          </div>
        ))}
      </nav>
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

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const email = user?.email ?? "user@kodeversity.com";
  const name = user?.name ?? "LMS User";
  const role = user?.role ?? "STUDENT";
  const initials = getInitials(email, name);

  const isAdmin = role === "ADMIN";
  const isInstructor = role === "INSTRUCTOR";
  const isStudent = role === "STUDENT";

  const handleLogout = async () => {
    await logout();
    onClose?.();
    if (isAdmin || isInstructor) {
      navigate("/admin/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-[var(--hairline)] bg-[var(--surface)]/60 backdrop-blur-sm">
      {}
      <div
        className={`flex items-center justify-between py-5 shrink-0 ${isStudent ? "px-5 lg:px-0 lg:justify-center" : "px-5"}`}
      >
        <div className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-lg grid place-items-center text-white font-bold shrink-0"
            style={{ background: "var(--grad-cta)" }}
          >
            K
          </div>
          <span
            className={`text-[17px] font-semibold tracking-tight ${isStudent ? "lg:hidden" : ""}`}
          >
            Kodeversity
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="h-7 w-7 grid place-items-center rounded-md border border-[var(--hairline)] text-muted-foreground hover:text-foreground lg:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {}
      <div className={`px-5 pb-2 shrink-0 ${isStudent ? "lg:hidden" : ""}`}>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
            isAdmin
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : isInstructor
                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isAdmin ? "bg-blue-400" : isInstructor ? "bg-purple-400" : "bg-emerald-400"
            }`}
          />
          {isAdmin ? "Admin Panel" : isInstructor ? "Instructor Portal" : "Student Space"}
        </span>
      </div>

      {}
      <nav
        data-lenis-prevent="true"
        className="px-2 pb-6 flex-1 min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {}
        {!isStudent && (
          <div className="mt-3">
            <NavLink
              to={isAdmin ? "/admin" : "/instructor/dashboard"}
              onClick={onClose}
              end
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white shadow-lg shadow-indigo-500/25 border-l-2 border-indigo-500"
                  : "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground/75 hover:text-foreground hover:bg-white/[0.04] transition border-l-2 border-transparent"
              }
              style={({ isActive }) =>
                isActive ? { background: "var(--grad-cta)" } : { background: "none" }
              }
            >
              <LayoutDashboard className="h-[18px] w-[18px]" />
              <span>Dashboard</span>
            </NavLink>
          </div>
        )}

        {isAdmin && (
          <>
            <Group title="MANAGE" items={adminManage} onClose={onClose} />
            <Group title="CONTENT & LEARNING" items={adminContent} onClose={onClose} />
            <Group title="FINANCE" items={adminFinance} onClose={onClose} />
            <Group title="SYSTEM" items={adminSystem} onClose={onClose} />
          </>
        )}

        {isInstructor && (
          <>
            <Group title="MY WORKSPACE" items={instructorContent} onClose={onClose} />
            <Group title="TOOLS" items={instructorTools} onClose={onClose} />
          </>
        )}

        {isStudent && (
          <>
            <StudentGroup title="WORKSPACE" items={studentWorkspace} onClose={onClose} />
            <StudentGroup title="SANDBOX" items={studentSandbox} onClose={onClose} />
          </>
        )}
      </nav>

      {}
      <div
        className={`p-3 shrink-0 border-t border-[var(--hairline)] space-y-2 ${isStudent ? "lg:hidden" : ""}`}
      >
        <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center gap-3">
          <div className="relative">
            <div
              className="h-10 w-10 rounded-full grid place-items-center text-white text-sm font-semibold"
              style={{
                background: isAdmin
                  ? "var(--grad-blue)"
                  : isInstructor
                    ? "var(--grad-purple)"
                    : "var(--grad-orange)",
              }}
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
            <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
              {role}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-xs font-semibold border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Secure Logout</span>
        </button>
      </div>

      {isStudent && (
        <div className="p-2 shrink-0 mt-auto hidden lg:block">
          <button
            onClick={handleLogout}
            className="w-full flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
