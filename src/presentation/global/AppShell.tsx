import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Home,
  BookOpenCheck,
  Map,
  Users,
  Code2,
  GraduationCap,
  Award,
  Settings,
  Bell,
  ShoppingCart,
  LayoutDashboard as DashIcon,
  Trophy,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import kodeversityLogo from "@/assets/kodeversity-logo.png";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";

const sidebarNav = [
  { icon: Home, label: "Home", to: "/" as const },
  { icon: BookOpenCheck, label: "Courses", to: "/courses" as const },
  { icon: Map, label: "Roadmaps", to: "/roadmaps" as const },
  { icon: Users, label: "Community", to: "/community" as const },
  { icon: Code2, label: "Practice", to: "/practice" as const },
  { icon: GraduationCap, label: "Mentorship", to: "/mentorship" as const },
  { icon: Award, label: "Certificates", to: "/certificates" as const },
];

const learnSidebarNav = [
  { icon: DashIcon, label: "Dashboard", to: "/dashboard" as const },
  { icon: BookOpenCheck, label: "My Course", to: "/courses" as const },
  { icon: Trophy, label: "Challenges", to: "/challenges" as const },
  { icon: FileText, label: "Notes", to: "/dashboard" as const },
  { icon: MessageSquare, label: "Q&A", to: "/community" as const },
  { icon: Award, label: "Progress", to: "/certificates" as const },
  { icon: Settings, label: "Settings", to: "/settings" as const },
];

const topNav = [
  { label: "Courses", to: "/courses" as const },
  { label: "Roadmaps", to: "/roadmaps" as const },
  { label: "Community", to: "/community" as const },
  { label: "Resources", to: "/" as const },
];

function getInitials(user: { email: string; name?: string }): string {
  if (user.name && user.name.trim()) {
    return user.name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

/** Role badge — small pill shown under user's email in the navbar. */
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    instructor: "text-violet-400 bg-violet-400/10 border-violet-400/30",
    student: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  };
  const cls = map[role] ?? "text-foreground/60 bg-foreground/5 border-border";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${cls}`}
    >
      {role === "admin" && <Shield className="h-2.5 w-2.5" />}
      {role}
    </span>
  );
}

export function AppShell({
  children,
  activeTop = "Courses",
  variant = "default",
}: {
  children: ReactNode;
  activeTop?: string;
  variant?: "default" | "learn";
}) {
  const isLearn = variant === "learn";
  const navItems = isLearn ? learnSidebarNav : sidebarNav;
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      void navigate({ to: "/" });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur-xl sm:h-16 md:h-20 md:px-8">
        {}
        <div className="flex items-center gap-2 md:gap-0">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link
            to="/"
            aria-label="Kodeversity home"
            className="inline-flex items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <img
              src={kodeversityLogo}
              alt=""
              aria-hidden="true"
              className="h-6 w-auto object-contain sm:h-7 md:h-[30px]"
            />
          </Link>
        </div>

        {!isLearn && (
          <nav className="hidden items-center gap-8 md:flex">
            {topNav.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className={`relative text-sm font-medium ${n.label === activeTop ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {n.label}
                {n.label === activeTop && (
                  <span className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-[image:var(--gradient-primary)]" />
                )}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search courses, skills..."
              className="w-64 rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <button
            aria-label="Cart"
            className="hidden h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground sm:grid"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
          <button
            aria-label="Notifications"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
          </button>

          {}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {}
              <div className="hidden flex-col items-end gap-0.5 sm:flex">
                <div className="text-xs font-semibold text-foreground leading-none">
                  {user.name || user.email}
                </div>
                <RoleBadge role={user.role} />
              </div>

              {}
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-xs font-bold text-primary-foreground">
                {getInitials(user)}
              </div>

              {}
              <button
                id="logout-btn"
                aria-label="Sign out"
                disabled={signingOut}
                onClick={handleLogout}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive disabled:opacity-50"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-lg bg-[image:var(--gradient-primary)] px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 md:px-4"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col border-r border-border bg-background p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <img
                src={kodeversityLogo}
                alt=""
                aria-hidden="true"
                className="h-6 w-auto object-contain"
              />
              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {}
            {isAuthenticated && user && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-3 py-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-xs font-bold text-primary-foreground">
                  {getInitials(user)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-foreground">
                    {user.name || user.email}
                  </div>
                  <RoleBadge role={user.role} />
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-1">
              {navItems.map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  activeOptions={{ exact: true }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground data-[status=active]:bg-primary-soft data-[status=active]:text-foreground data-[status=active]:ring-1 data-[status=active]:ring-primary/40"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            {}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                disabled={signingOut}
                className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/[0.06] hover:text-destructive disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>{signingOut ? "Signing out…" : "Sign out"}</span>
              </button>
            )}
          </aside>
        </div>
      )}

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-20 shrink-0 flex-col border-r border-border/60 bg-background/60 px-2 py-4 sm:top-16 sm:h-[calc(100vh-4rem)] md:top-20 md:h-[calc(100vh-5rem)] md:flex">
          <nav className="flex flex-col gap-1">
            {navItems.map(({ icon: Icon, label, to }) => (
              <Link
                key={label}
                to={to}
                activeOptions={{ exact: true }}
                className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground data-[status=active]:bg-primary-soft data-[status=active]:text-foreground data-[status=active]:ring-1 data-[status=active]:ring-primary/40"
              >
                <Icon className="h-5 w-5" />
                <span className="leading-tight">{label}</span>
              </Link>
            ))}
          </nav>

          {}
          {isAuthenticated && (
            <button
              id="sidebar-logout-btn"
              aria-label="Sign out"
              title="Sign out"
              disabled={signingOut}
              onClick={handleLogout}
              className="mt-auto flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-destructive/[0.06] hover:text-destructive disabled:opacity-50"
            >
              <LogOut className="h-5 w-5" />
              <span className="leading-tight">Sign out</span>
            </button>
          )}
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}
