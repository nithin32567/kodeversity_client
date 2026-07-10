import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/app/hooks";
import { selectIsLoading, selectUser } from "@/features/auth/authSlice";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Toaster } from "@/presentation/core-ui/sonner";

export function PortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoading = useAppSelector(selectIsLoading);
  const user = useAppSelector(selectUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isStudent = user?.role === "STUDENT";

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to the correct login portal based on the URL being accessed
      if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/instructor")) {
        navigate(`/admin/login?redirect=${encodeURIComponent(location.pathname)}`, {
          replace: true,
        });
      } else {
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
      }
    }
  }, [isLoading, user, location.pathname, navigate]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="admin-theme min-h-screen bg-background text-foreground lg:flex">
      {}
      <div
        className={`hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:max-h-screen shrink-0 transition-all duration-300 ${isStudent ? "w-20" : "w-[248px]"}`}
      >
        <Sidebar />
      </div>

      {}
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

      {}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto bg-background/50">
          <Outlet />
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
export default PortalLayout;
