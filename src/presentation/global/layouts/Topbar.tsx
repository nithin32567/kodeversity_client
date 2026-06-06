import { Menu, Search, Sun, Bell, MessageSquare, Plus, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { useNavigate, useLocation } from "@tanstack/react-router";

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

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = user?.email ?? "user@kodeversity.com";
  const name = user?.name ?? "LMS User";
  const role = user?.role ?? "STUDENT";
  const initials = getInitials(email, name);

  const isAdmin = role === "ADMIN";
  const isInstructor = role === "INSTRUCTOR";
  const isStudent = role === "STUDENT";

  const handleLogout = async () => {
    await logout();
    if (isAdmin || isInstructor) {
      void navigate({ to: "/admin/login" });
    } else {
      void navigate({ to: "/login" });
    }
  };

  // Title & subtitle resolution
  let portalTitle = "Student Workspace";
  let portalSubtitle = `Welcome back, ${name} · Student`;
  let searchPlaceholder = "Search enrolled courses, classes...";

  if (isAdmin) {
    portalTitle = "Admin Dashboard";
    portalSubtitle = `Welcome back, ${name}`;
    searchPlaceholder = "Search anything...";
  } else if (isInstructor) {
    portalTitle = "Instructor Dashboard";
    portalSubtitle = `Welcome back, ${name} · Instructor`;
    searchPlaceholder = "Search courses, batches...";
  } else {
    // Student - Resolve page title dynamically if possible
    if (location.pathname.includes("/student/dashboard")) {
      portalTitle = "Student Dashboard";
    } else if (location.pathname.includes("/student/courses")) {
      portalTitle = "My Courses";
    } else if (location.pathname.includes("/student/batches")) {
      portalTitle = "My Batches";
    } else if (location.pathname.includes("/student/live-classes")) {
      portalTitle = "Live Classroom Schedule";
    } else if (location.pathname.includes("/student/profile")) {
      portalTitle = "Student Profile";
    } else if (location.pathname.includes("/student/playground")) {
      portalTitle = "Lab Playground";
    } else if (location.pathname.includes("/student/challenges")) {
      portalTitle = "DevOps Challenges";
    } else if (location.pathname.includes("/student/settings")) {
      portalTitle = "Account Settings";
    } else if (location.pathname.includes("/student/certificates")) {
      portalTitle = "My Certificates";
    }
  }

  return (
    <header className="flex flex-wrap items-center gap-3 px-4 pt-4 pb-4 sm:px-5 lg:px-6 lg:pt-5 border-b border-[var(--hairline)] bg-[var(--surface)]/30 backdrop-blur-sm shrink-0">
      <button
        onClick={onMenuClick}
        className="grid h-10 w-10 place-items-center rounded-md bg-[var(--surface)] border border-[var(--hairline)] text-foreground/80 lg:hidden cursor-pointer"
        title="Open menu"
      >
        <Menu className="h-[18px] w-[18px]" />
      </button>

      <div className="min-w-0 flex-1 sm:flex-none">
        <h1 className="text-[20px] sm:text-[22px] font-semibold tracking-tight leading-tight font-display">
          {portalTitle}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{portalSubtitle}</p>
      </div>

      <div className="order-3 w-full sm:order-none sm:flex-1 sm:min-w-[200px] sm:max-w-xl sm:mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-9 pr-14 rounded-md bg-[var(--surface)] border border-[var(--hairline)] text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[var(--hairline)] bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-muted-foreground hidden md:inline-block">
            Ctrl K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <IconBtn>
          <Sun className="h-[18px] w-[18px]" />
        </IconBtn>
        <IconBtn badge={3} badgeColor="bg-rose-500">
          <Bell className="h-[18px] w-[18px]" />
        </IconBtn>
        <IconBtn badge={1} badgeColor="bg-blue-500">
          <MessageSquare className="h-[18px] w-[18px]" />
        </IconBtn>

        <div className="h-8 w-[1px] bg-[var(--hairline)] mx-1" />

        <div className="relative flex items-center gap-2">
          <div className="relative">
            <div
              className="h-10 w-10 rounded-full grid place-items-center text-white font-semibold text-sm cursor-pointer"
              style={{
                background: isAdmin
                  ? "var(--grad-blue)"
                  : isInstructor
                    ? "var(--grad-purple)"
                    : "var(--grad-orange)",
              }}
              title={name}
            >
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[var(--background)]" />
          </div>
          <button
            onClick={handleLogout}
            className="grid h-10 w-10 place-items-center rounded-md bg-[var(--surface)] border border-[var(--hairline)] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>

        {isAdmin && (
          <button
            className="hidden sm:inline-flex ml-2 items-center gap-1.5 h-10 px-4 rounded-md text-sm font-medium text-white shadow-lg shadow-indigo-500/25 cursor-pointer"
            style={{ background: "var(--grad-cta)" }}
          >
            <Plus className="h-4 w-4" /> Add New
          </button>
        )}
        {isInstructor && (
          <button
            onClick={() => void navigate({ to: "/instructor/courses" })}
            className="hidden sm:inline-flex ml-2 items-center gap-1.5 h-10 px-4 rounded-md text-sm font-medium text-white shadow-lg shadow-purple-500/25 cursor-pointer"
            style={{ background: "var(--grad-purple)" }}
          >
            <Plus className="h-4 w-4" /> My Courses
          </button>
        )}
        {isStudent && (
          <button
            onClick={() => void navigate({ to: "/courses" })}
            className="hidden sm:inline-flex ml-2 items-center gap-1.5 h-10 px-4 rounded-md text-sm font-medium text-white shadow-lg shadow-indigo-500/25 cursor-pointer"
            style={{ background: "var(--grad-cta)" }}
          >
            <ShoppingCart className="h-4 w-4" /> Catalog
          </button>
        )}
      </div>
    </header>
  );
}

function IconBtn({
  children,
  badge,
  badgeColor = "bg-rose-500",
}: {
  children: React.ReactNode;
  badge?: number;
  badgeColor?: string;
}) {
  return (
    <button className="relative h-10 w-10 grid place-items-center rounded-md bg-[var(--surface)] border border-[var(--hairline)] text-foreground/80 hover:text-foreground cursor-pointer">
      {children}
      {badge !== undefined && (
        <span
          className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold text-white grid place-items-center ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
