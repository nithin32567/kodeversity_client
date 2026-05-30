import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/presentation/features/admin-analytics/components/Sidebar";
import { Topbar } from "@/presentation/features/admin-analytics/components/Topbar";

export function AdminLayout() {
  return (
    <div className="admin-theme min-h-screen bg-background text-foreground lg:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <Outlet />
      </div>
    </div>
  );
}
