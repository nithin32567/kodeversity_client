import React from "react";
import { UserPlus, Search, Check, RefreshCw, Sparkles } from "lucide-react";
import type { User } from "@/domain/user";

interface AddStudentsPanelProps {
  availableStudents: User[];
  studentSearchQuery: string;
  setStudentSearchQuery: (query: string) => void;
  selectedStudentIds: string[];
  toggleStudentSelection: (id: string) => void;
  onEnrollStudents: () => void;
  isEnrolling: boolean;
  onClearSelections: () => void;
}

export function AddStudentsPanel({
  availableStudents,
  studentSearchQuery,
  setStudentSearchQuery,
  selectedStudentIds,
  toggleStudentSelection,
  onEnrollStudents,
  isEnrolling,
  onClearSelections,
}: AddStudentsPanelProps) {
  return (
    <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] space-y-4 shadow-lg">
      <div>
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-emerald-400" />
          Add Students to Batch
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Select unregistered students from the active database to enroll in bulk.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
        <input
          type="text"
          value={studentSearchQuery}
          onChange={(e) => setStudentSearchQuery(e.target.value)}
          placeholder="Filter students by name/email..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      <div className="border border-[var(--hairline)] rounded-lg bg-[var(--surface-2)]/30 max-h-[220px] overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {availableStudents.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            {studentSearchQuery
              ? "No matching students found."
              : "All registered students are enrolled."}
          </div>
        ) : (
          availableStudents.map((student) => {
            const isSelected = selectedStudentIds.includes(student.id);
            return (
              <div
                key={student.id}
                onClick={() => toggleStudentSelection(student.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition select-none ${
                  isSelected
                    ? "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                    : "hover:bg-[var(--surface-2)] border border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition ${
                    isSelected
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-muted-foreground/50 bg-[var(--surface)]"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3px]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate">
                    {student.name || "Unnamed Student"}
                  </div>
                  <div className="text-[10px] opacity-70 truncate">{student.email}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-medium text-muted-foreground">
          Selected:{" "}
          <span className="font-bold text-foreground font-mono">{selectedStudentIds.length}</span>
        </span>
        {selectedStudentIds.length > 0 && (
          <button
            onClick={onClearSelections}
            className="text-[11px] text-muted-foreground hover:text-foreground transition underline cursor-pointer"
          >
            Clear Selections
          </button>
        )}
      </div>

      <button
        onClick={onEnrollStudents}
        disabled={selectedStudentIds.length === 0 || isEnrolling}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
      >
        {isEnrolling ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Enrolling Students...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Enroll Selected Students
          </>
        )}
      </button>
    </div>
  );
}
