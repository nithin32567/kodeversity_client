import {
  Loader2,
  X,
  Phone,
  GraduationCap,
  Calendar,
  BookOpen,
  Trash2,
  Edit2,
  ShieldOff,
  UserCheck,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { User } from "@/domain/user";
import type { ActionType } from "./ActionModal";

export interface Student extends User {
  phone?: string;
  highestQualification?: string;
  createdAt?: string;
  updatedAt?: string;
  enrolledCourses?: unknown[];
  chapterProgress?: unknown[];
}

export interface StudentCardProps {
  student: Student;
  activeTab: "ACTIVE" | "SUSPENDED";
  isProcessing: boolean;
  onEdit: (student: Student) => void;
  onAction: (type: ActionType, student: Student) => void;
}

export function StudentCard({
  student,
  activeTab,
  isProcessing,
  onEdit,
  onAction,
}: StudentCardProps) {
  return (
    <div
      className={`flex flex-col justify-between p-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/20 shadow-sm hover:border-indigo-500/30 hover:shadow-md transition-all relative ${
        isProcessing ? "opacity-70 pointer-events-none" : ""
      }`}
    >
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-sm">
          <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative shrink-0">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.name}
                className={`h-9 w-9 rounded-lg object-cover border border-[var(--hairline)] ${
                  activeTab === "SUSPENDED" ? "grayscale opacity-60" : ""
                }`}
              />
            ) : (
              <div
                className={`h-9 w-9 rounded-lg grid place-items-center text-white text-xs font-bold border border-[var(--hairline)] ${
                  activeTab === "SUSPENDED" ? "bg-zinc-700" : ""
                }`}
                style={activeTab === "ACTIVE" ? { background: "var(--grad-purple)" } : {}}
              >
                {(student.name || "UN").slice(0, 2).toUpperCase()}
              </div>
            )}
            {activeTab === "ACTIVE" ? (
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[var(--surface)]" />
            ) : (
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[var(--surface)] flex items-center justify-center">
                <X className="h-2 w-2 text-white" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold truncate text-foreground">
              <Link
                to={`/admin/users/${student.id}`}
                className="hover:underline hover:text-indigo-400 transition"
              >
                {student.name}
              </Link>
            </div>
            <div className="text-[11px] text-muted-foreground truncate" title={student.email}>
              {student.email}
            </div>
            <div className="mt-0.5 text-[9px] uppercase font-bold tracking-wider text-indigo-400">
              {student.role || "STUDENT"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            to={`/admin/users/${student.id}`}
            className="p-1.5 rounded-md border border-[var(--hairline)] bg-[var(--surface-2)]/30 text-muted-foreground hover:text-indigo-400 hover:bg-[var(--surface-2)] transition cursor-pointer"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => onEdit(student)}
            className="p-1.5 rounded-md border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition cursor-pointer"
            title="Edit Profile"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          {activeTab === "ACTIVE" ? (
            <button
              onClick={() => onAction("SUSPEND", student)}
              className="p-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
              title="Suspend Account"
            >
              <ShieldOff className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onAction("ACTIVATE", student)}
              className="p-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
              title="Activate Account"
            >
              <UserCheck className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5 mt-3 pt-3 border-t border-[var(--hairline)]">
        {student.phone && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" />
            <span className="truncate">{student.phone}</span>
          </div>
        )}
        {student.highestQualification && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <GraduationCap className="h-3 w-3 shrink-0" />
            <span className="truncate">{student.highestQualification}</span>
          </div>
        )}
        {student.createdAt && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <BookOpen className="h-3 w-3 text-indigo-400 shrink-0" />
            <span>Courses: {student.enrolledCourses?.length || 0}</span>
          </div>

          <button
            onClick={() => onAction("DELETE", student)}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 hover:text-white px-2 py-0.5 rounded border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 transition cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
