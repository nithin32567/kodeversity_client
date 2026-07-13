import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { selectIsAuthenticated, selectIsLoading, selectUserRole } from "@/features/auth/authSlice";
import { UserRole } from "@/domain/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  loginPath?: string;
  children?: ReactNode;
}

function dashboardForRole(role: UserRole | null): string {
  switch (role) {
    case UserRole.ADMIN:
      return "/admin/dashboard";
    case UserRole.INSTRUCTOR:
      return "/instructor/dashboard";
    default:
      return "/student/dashboard";
  }
}

export function ProtectedRoute({
  allowedRoles,
  loginPath = "/login",
  children,
}: ProtectedRouteProps) {
  const location = useLocation();
  const isLoading = useAppSelector(selectIsLoading);
  const isAuth = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectUserRole);

  if (isLoading) {
    return null;
  }

  if (!isAuth) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const path = location.pathname;
    const isAdminPath = path === "/admin" || path.startsWith("/admin/");
    const isInstructorPath = path === "/instructor" || path.startsWith("/instructor/");

    if (role === UserRole.STUDENT && (isAdminPath || isInstructorPath)) {
      return <Navigate to="/" replace />;
    }
    if (role === UserRole.INSTRUCTOR && isAdminPath) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to={dashboardForRole(role)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
