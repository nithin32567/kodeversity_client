import { Outlet } from "react-router-dom";
import { Toaster } from "@/presentation/core-ui/sonner";
import { SmoothScroll } from "@/presentation/global/SmoothScroll";

export function PublicLayout() {
  return (
    <>
      <SmoothScroll />
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}
