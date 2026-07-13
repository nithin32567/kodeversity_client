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
      className={`flex flex-col p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] transition relative ${
        isProcessing ? "opacity-70 pointer-events-none" : "hover:bg-[var(--surface-2)]"
      }`}
    >
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-2xl backdrop-blur-sm">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative">
          {student.avatarUrl ? (
            <img
              src={student.avatarUrl}
              alt={student.name}
              className={`h-12 w-12 rounded-full object-cover border border-[var(--hairline)] ${
                activeTab === "SUSPENDED" ? "grayscale opacity-60" : ""
              }`}
            />
          ) : (
            <div
              className={`h-12 w-12 rounded-full grid place-items-center text-white text-sm font-semibold border border-[var(--hairline)] ${
                activeTab === "SUSPENDED" ? "bg-zinc-700" : ""
              }`}
              style={activeTab === "ACTIVE" ? { background: "var(--grad-purple)" } : {}}
            >
              {(student.name || "UN").slice(0, 2).toUpperCase()}
            </div>
          )}
          {activeTab === "ACTIVE" ? (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-[var(--surface)]" />
          ) : (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-rose-500 ring-2 ring-[var(--surface)] flex items-center justify-center">
              <X className="h-2.5 w-2.5 text-white" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate text-foreground">
            <Link
              to={`/admin/users/${student.id}`}
              className="hover:underline hover:text-purple-400 transition"
            >
              {student.name}
            </Link>
          </div>
          <div className="text-xs text-muted-foreground truncate">{student.email}</div>
          <div className="mt-1 text-[10px] uppercase font-bold tracking-wider text-blue-400">
            {student.role || "STUDENT"}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Link
            to={`/admin/users/${student.id}`}
            className="h-7 w-7 rounded-md grid place-items-center border border-[var(--hairline)] text-muted-foreground hover:text-purple-400 hover:bg-[var(--surface-2)] transition cursor-pointer"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => onEdit(student)}
            className="h-7 w-7 rounded-md grid place-items-center border border-[var(--hairline)] text-muted-foreground hover:text-indigo-400 hover:bg-[var(--surface-2)] transition cursor-pointer"
            title="Edit Profile"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          {activeTab === "ACTIVE" ? (
            <button
              onClick={() => onAction("SUSPEND", student)}
              className="h-7 w-7 rounded-md grid place-items-center border border-[var(--hairline)] text-muted-foreground hover:text-amber-500 hover:bg-[var(--surface-2)] transition cursor-pointer"
              title="Suspend Account"
            >
              <ShieldOff className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onAction("ACTIVATE", student)}
              className="h-7 w-7 rounded-md grid place-items-center border border-[var(--hairline)] text-muted-foreground hover:text-emerald-500 hover:bg-[var(--surface-2)] transition cursor-pointer"
              title="Activate Account"
            >
              <UserCheck className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mt-4 pt-4 border-t border-[var(--hairline)]">
        {student.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>{student.phone}</span>
          </div>
        )}
        {student.highestQualification && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>{student.highestQualification}</span>
          </div>
        )}
        {student.createdAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Enrolled Courses: {student.enrolledCourses?.length || 0}</span>
          </div>

          <button
            onClick={() => onAction("DELETE", student)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-white px-2 py-1 rounded border border-rose-500/30 hover:bg-rose-500 transition cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
