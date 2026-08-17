import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { SidebarHeader } from "./SidebarHeader";
import { NavGroup } from "./NavGroup";
import { SidebarProfile } from "./SidebarProfile";
import { getInitials } from "./utils";
import {
  adminManage,
  adminContent,
  adminSystem,
  instructorContent,
  studentWorkspace,
  studentSandbox,
} from "./navConfig";

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const email = user?.email ?? "user@studylaah.com";
  const name = user?.name ?? "LMS User";
  const role = user?.role ?? "STUDENT";
  const initials = getInitials(email, name);

  const isAdmin = role === "ADMIN";
  const isInstructor = role === "INSTRUCTOR";
  const isStudent = role === "STUDENT";

  const handleLogout = async () => {
    await logout();
    onClose?.();
    if (isAdmin || isInstructor) {
      navigate("/admin/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-[var(--hairline)] bg-[var(--surface)]/60 backdrop-blur-sm">
      <SidebarHeader
        isStudent={isStudent}
        isAdmin={isAdmin}
        isInstructor={isInstructor}
        onClose={onClose}
      />

      <nav
        data-lenis-prevent="true"
        className="px-2 pb-6 flex-1 min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {!isStudent && (
          <div className="mt-3">
            <NavLink
              to={isAdmin ? "/admin" : "/instructor/dashboard"}
              onClick={onClose}
              end
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white shadow-lg shadow-indigo-500/25 border-l-2 border-indigo-500"
                  : "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground/75 hover:text-foreground hover:bg-white/[0.04] transition border-l-2 border-transparent"
              }
              style={({ isActive }) =>
                isActive ? { background: "var(--grad-cta)" } : { background: "none" }
              }
            >
              <LayoutDashboard className="h-[18px] w-[18px]" />
              <span>Dashboard</span>
            </NavLink>
          </div>
        )}

        {isAdmin && (
          <>
            <NavGroup title="MANAGE" items={adminManage} onClose={onClose} />
            <NavGroup title="CONTENT & LEARNING" items={adminContent} onClose={onClose} />
            <NavGroup title="SYSTEM" items={adminSystem} onClose={onClose} />
          </>
        )}

        {isInstructor && (
          <>
            <NavGroup title="MY WORKSPACE" items={instructorContent} onClose={onClose} />
          </>
        )}

        {isStudent && (
          <>
            <NavGroup title="WORKSPACE" items={studentWorkspace} onClose={onClose} isStudent={true} />
            <NavGroup title="SANDBOX" items={studentSandbox} onClose={onClose} isStudent={true} />
          </>
        )}
      </nav>

      <SidebarProfile
        isStudent={isStudent}
        isAdmin={isAdmin}
        isInstructor={isInstructor}
        initials={initials}
        name={name}
        role={role}
        handleLogout={handleLogout}
      />
    </aside>
  );
}
