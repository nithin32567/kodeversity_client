import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Video,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  MessageSquare,
  BadgeCheck,
  ChevronLeft,
} from "lucide-react";
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

export function StudentLayout({ children }: { children?: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const email = user?.email ?? "student@kodeversity.com";
  const name = user?.name ?? "Student User";
  const role = user?.role ?? "STUDENT";
  const initials = getInitials(email, name);

  const handleLogout = async () => {
    await logout();
    void navigate({ to: "/login" });
  };

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "All Courses", icon: BookOpen, to: "/courses" },
    { label: "My Batches", icon: Layers, to: "/my-batches" },
    { label: "Live Classes", icon: Video, to: "/live-classes" },
    { label: "Profile", icon: User, to: "/profile" },
  ];

  // Resolve current active page title
  const currentItem = navItems.find((item) => {
    if (item.to === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(item.to);
  });
  const pageTitle = currentItem?.label ?? "Student Workspace";

  return (
    <div className="admin-theme min-h-screen bg-background text-foreground lg:flex">
      {/* ── DESKTOP SIDEBAR ── */}
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

        {/* Sidebar Nav */}
        <nav
          data-lenis-prevent="true"
          className="px-2 pb-6 flex-1 min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-1.5"
        >
          <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/70 uppercase">
            Workspace
          </div>
          
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeProps={{
                className:
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white font-semibold shadow-lg shadow-indigo-500/10",
                style: { background: "var(--grad-cta)" },
              }}
              inactiveProps={{
                className:
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-foreground/75 hover:text-foreground hover:bg-white/[0.04] transition-colors font-medium",
              }}
            >
              <item.icon className="h-[18px] w-[18px] opacity-85" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Profile Details & Logout */}
        <div className="p-3 shrink-0 border-t border-[var(--hairline)] space-y-2">
          {/* User Profile Card */}
          <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center gap-3">
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
              <div className="text-sm font-semibold flex items-center gap-1">
                <span className="truncate">{name}</span>
                <BadgeCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{role}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE MENU DRAWER ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-[var(--hairline)] bg-[var(--surface)] p-4 shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--hairline)]">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-lg grid place-items-center text-white font-bold text-sm"
                  style={{ background: "var(--grad-cta)" }}
                >
                  K
                </div>
                <span className="text-base font-semibold">Kodeversity</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg border border-[var(--hairline)] hover:bg-[var(--surface-2)] text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Nav links */}
            <nav className="flex-1 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  activeProps={{
                    className:
                      "flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm text-white font-bold",
                    style: { background: "var(--grad-cta)" },
                  }}
                  inactiveProps={{
                    className:
                      "flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-[var(--surface-2)] transition",
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Footer profile & logout */}
            <div className="pt-4 border-t border-[var(--hairline)] space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-full grid place-items-center text-white text-xs font-semibold"
                  style={{ background: "var(--grad-purple)" }}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate">{name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8 border-b border-[var(--hairline)] bg-[var(--surface)]/30 backdrop-blur-sm shrink-0">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--surface-2)]/40 border border-[var(--hairline)] text-foreground lg:hidden cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Active section header */}
          <div className="min-w-0">
            <h1 className="text-[20px] font-semibold tracking-tight leading-tight">{pageTitle}</h1>
            <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">Kodeversity Student Space</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Notifications */}
            <button className="relative h-10 w-10 grid place-items-center rounded-md bg-[var(--surface-2)]/45 border border-[var(--hairline)] text-foreground hover:text-white transition cursor-pointer">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold text-white grid place-items-center bg-blue-500 shadow-md">
                3
              </span>
            </button>

            {/* Q&A / Messages */}
            <button className="relative h-10 w-10 grid place-items-center rounded-md bg-[var(--surface-2)]/45 border border-[var(--hairline)] text-foreground hover:text-white transition cursor-pointer">
              <MessageSquare className="h-[18px] w-[18px]" />
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold text-white grid place-items-center bg-rose-500 shadow-md">
                1
              </span>
            </button>

            <div className="h-8 w-[1px] bg-[var(--hairline)] mx-1" />

            {/* User Avatar Initials */}
            <div className="relative">
              <div
                className="h-9 w-9 rounded-full grid place-items-center text-white text-xs font-bold cursor-pointer transition hover:opacity-95"
                style={{ background: "var(--grad-orange)" }}
                title={name}
              >
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[var(--surface)]" />
            </div>
          </div>
        </header>

        {/* Page contents (dynamic rendering) */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {children ?? <Outlet />}
        </div>
      </div>
    </div>
  );
}
