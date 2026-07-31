import React from "react";
import {
  Edit2,
  PauseCircle,
  PlayCircle,
  Trash2,
  UserPlus,
  BookOpen,
  Calendar,
  Clock,
  Users,
  ChevronDown,
} from "lucide-react";
import type { Batch } from "@/infrastructure/admin/managementService";
import type { Instructor } from "@/domain/course";
import { BatchStatusBadge } from "./BatchStatusBadge";

interface BatchOverviewCardProps {
  batch: Batch;
  instructors: Instructor[];
  rosterCount: number;
  isInstructor: boolean;
  isAssigningInstructor: boolean;
  onAssignInstructor: (instructorId: string) => void;
  onEdit: () => void;
  onToggleSuspend: () => void;
  onDelete: () => void;
}

export function BatchOverviewCard({
  batch,
  instructors,
  rosterCount,
  isInstructor,
  isAssigningInstructor,
  onAssignInstructor,
  onEdit,
  onToggleSuspend,
  onDelete,
}: BatchOverviewCardProps) {
  return (
    <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] space-y-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full blur-2xl" />

      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground font-display">
            {batch.name}
          </h3>
          <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-mono bg-white/[0.04] text-muted-foreground rounded-lg border border-[var(--hairline)]">
            Code: {batch.code}
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <BatchStatusBadge status={batch.status} />
          {!isInstructor && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-muted-foreground hover:text-blue-400 transition"
                title="Edit Batch"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={onToggleSuspend}
                className="p-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-muted-foreground hover:text-amber-400 transition"
                title={batch.status === "SUSPENDED" ? "Activate Batch" : "Suspend Batch"}
              >
                {batch.status === "SUSPENDED" ? (
                  <PlayCircle className="h-4 w-4" />
                ) : (
                  <PauseCircle className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-muted-foreground hover:text-rose-400 transition"
                title="Delete Batch"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3.5 pt-4 border-t border-[var(--hairline)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-emerald-400 shrink-0" />
            Instructor
          </span>
          {!isInstructor ? (
            <div className="relative">
              <select
                value={batch.instructorId || ""}
                onChange={(e) => onAssignInstructor(e.target.value)}
                disabled={isAssigningInstructor}
                className="pl-3 pr-8 py-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-xs focus:outline-none focus:border-blue-500 transition text-foreground appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>
          ) : (
            <span className="font-semibold text-foreground">
              {instructors.find((i) => i.id === batch.instructorId)?.name || "Unassigned"}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-400 shrink-0" />
            Course
          </span>
          <span className="font-semibold text-foreground max-w-[200px] truncate text-right">
            {batch.course?.name || "General Study Batch"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-400 shrink-0" />
            Start Date
          </span>
          <span className="font-medium text-foreground">
            {new Date(batch.startDate).toLocaleDateString(undefined, {
              dateStyle: "medium",
            })}
          </span>
        </div>
        {batch.endDate && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              End Date
            </span>
            <span className="font-medium text-foreground">
              {new Date(batch.endDate).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400 shrink-0" />
            Current Roster
          </span>
          <span className="font-bold text-foreground font-mono bg-white/[0.04] px-2 py-0.5 rounded border border-[var(--hairline)]">
            {rosterCount} student{rosterCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
