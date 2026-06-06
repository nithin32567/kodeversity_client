import { Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function PortalLayout() {
  const location = useLocation();
  const { isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Skip rendering layout wrappers for login / registration pages
  const isLoginPage =
    location.pathname === "/login" ||
    location.pathname === "/admin/login" ||
    location.pathname === "/register" ||
    location.pathname === "/admin/register";

  if (isLoginPage) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="admin-theme min-h-screen bg-background text-foreground lg:flex">
      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:max-h-screen w-[248px] shrink-0">
        <Sidebar />
      </div>

      {/* ── MOBILE MENU DRAWER ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col shadow-2xl animate-slide-in">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto bg-background/50">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
export default PortalLayout;
