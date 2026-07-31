import React from "react";
import { Users, Trash2 } from "lucide-react";
import type { BatchStudent } from "@/infrastructure/admin/managementService";

interface CohortRosterTableProps {
  roster: BatchStudent[];
  isRosterLoading: boolean;
  onRemoveStudent: (studentId: string, studentName: string) => void;
}

export function CohortRosterTable({
  roster,
  isRosterLoading,
  onRemoveStudent,
}: CohortRosterTableProps) {
  return (
    <div className="lg:col-span-7 p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-lg space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-[var(--hairline)]">
        <div>
          <h3 className="font-semibold text-lg text-foreground font-display flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Cohort Roster
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Currently active students in this learning cohort.
          </p>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono bg-white/[0.04] text-muted-foreground rounded-lg border border-[var(--hairline)]">
          Total: {roster.length}
        </span>
      </div>

      {isRosterLoading ? (
        <div className="py-12 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center animate-pulse py-2">
              <div className="h-10 w-10 rounded-full bg-white/[0.04]" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-white/[0.04] rounded w-1/3" />
                <div className="h-3 bg-white/[0.04] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : roster.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <h4 className="font-semibold text-foreground/80">Roster is empty</h4>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            No students assigned to this batch yet. Use the left panel checklist tool to select and
            enroll active students.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-[var(--hairline)]">
                <th className="py-3 font-semibold">Student</th>
                <th className="py-3 px-4 font-semibold">Enrolled On</th>
                <th className="py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline)]">
              {roster.map((r) => (
                <tr key={r.id} className="group hover:bg-[var(--surface-2)]/30 transition">
                  <td className="py-3.5 pr-2">
                    <div className="flex items-center gap-3">
                      {r.student.avatarUrl ? (
                        <img
                          src={r.student.avatarUrl}
                          alt={r.student.name || ""}
                          className="h-9 w-9 rounded-full object-cover border border-[var(--hairline)]"
                        />
                      ) : (
                        <div
                          className="h-9 w-9 rounded-full grid place-items-center text-white text-[11px] font-semibold border border-[var(--hairline)]"
                          style={{ background: "var(--grad-purple)" }}
                        >
                          {(r.student.name || "ST").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate max-w-[200px]">
                          {r.student.name || "Unnamed Student"}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {r.student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-muted-foreground">
                    {new Date(r.joinedAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() =>
                        onRemoveStudent(r.studentId, r.student.name || r.student.email)
                      }
                      className="p-2 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
                      title="Remove student from batch"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
