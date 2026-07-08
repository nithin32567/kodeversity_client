/**
 * StudentLayout
 *
 * Shell for all /student/* routes.
 * Replace the placeholder navbar with your real StudentNavbar component.
 */
import { Outlet } from "react-router-dom";
import { Toaster } from "@/presentation/core-ui/sonner";

export function StudentLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Top navbar placeholder — swap with your StudentNavbar ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-card px-6 py-3">
        <span className="text-sm font-semibold text-muted-foreground">Student Portal</span>
        {/* <StudentNavbar /> */}
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
