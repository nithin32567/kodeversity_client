import { AppShell } from "@/presentation/global/AppShell";
import { Outlet } from "@tanstack/react-router";

export function StudentLayout({ children }: { children?: React.ReactNode }) {
  return <AppShell>{children ?? <Outlet />}</AppShell>;
}
