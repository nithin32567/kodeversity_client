import { LogOut, BadgeCheck } from "lucide-react";

interface SidebarProfileProps {
  isStudent: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  initials: string;
  name: string;
  role: string;
  handleLogout: () => void;
}

export function SidebarProfile({
  isStudent,
  isAdmin,
  isInstructor,
  initials,
  name,
  role,
  handleLogout,
}: SidebarProfileProps) {
  return (
    <>
      <div
        className={`p-3 shrink-0 border-t border-[var(--hairline)] space-y-2 ${isStudent ? "lg:hidden" : ""}`}
      >
        <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center gap-3">
          <div className="relative">
            <div
              className="h-10 w-10 rounded-full grid place-items-center text-white text-sm font-semibold"
              style={{
                background: isAdmin
                  ? "var(--grad-blue)"
                  : isInstructor
                    ? "var(--grad-purple)"
                    : "var(--grad-orange)",
              }}
            >
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[var(--surface-2)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium flex items-center gap-1 truncate">
              <span className="truncate">{name}</span>
              <BadgeCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            </div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
              {role}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-xs font-semibold border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Secure Logout</span>
        </button>
      </div>

      {isStudent && (
        <div className="p-2 shrink-0 mt-auto hidden lg:block">
          <button
            onClick={handleLogout}
            className="w-full flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </>
  );
}
