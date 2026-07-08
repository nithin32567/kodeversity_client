/**
 * InstructorLayout
 *
 * Shell for all /instructor/* routes.
 * Replace the placeholder sidebar with your real InstructorSidebar component.
 */
import { Outlet } from "react-router-dom";
import { Toaster } from "@/presentation/core-ui/sonner";

export function InstructorLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar placeholder — swap with your InstructorSidebar ── */}
      <aside className="w-64 shrink-0 border-r border-border bg-card">
        <div className="p-4 text-sm font-semibold text-muted-foreground">Instructor Panel</div>
        {/* <InstructorSidebar /> */}
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
