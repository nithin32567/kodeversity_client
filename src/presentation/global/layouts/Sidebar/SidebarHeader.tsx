import { ChevronLeft } from "lucide-react";

interface SidebarHeaderProps {
  isStudent: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  onClose?: () => void;
}

export function SidebarHeader({ isStudent, isAdmin, isInstructor, onClose }: SidebarHeaderProps) {
  return (
    <>
      <div
        className={`flex items-center justify-between py-5 shrink-0 ${isStudent ? "px-5 lg:px-0 lg:justify-center" : "px-5"}`}
      >
        <div className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-lg grid place-items-center text-white font-bold shrink-0"
            style={{ background: "var(--grad-cta)" }}
          >
            K
          </div>
          <span
            className={`text-[17px] font-semibold tracking-tight ${isStudent ? "lg:hidden" : ""}`}
          >
            Kodeversity
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="h-7 w-7 grid place-items-center rounded-md border border-[var(--hairline)] text-muted-foreground hover:text-foreground lg:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={`px-5 pb-2 shrink-0 ${isStudent ? "lg:hidden" : ""}`}>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
            isAdmin
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : isInstructor
                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isAdmin ? "bg-blue-400" : isInstructor ? "bg-purple-400" : "bg-emerald-400"
            }`}
          />
          {isAdmin ? "Admin Panel" : isInstructor ? "Instructor Portal" : "Student Space"}
        </span>
      </div>
    </>
  );
}
