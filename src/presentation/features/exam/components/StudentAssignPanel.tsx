/**
 * StudentAssignPanel.tsx
 * Step 3 of the Exam Builder wizard — assign exam to students.
 * Backend assignment not yet available; shows UI with a placeholder toast on submit.
 */
import { useState, useMemo, useEffect, forwardRef, useImperativeHandle } from "react";
import { Search, Users, CheckSquare, Square, Calendar } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";
import { useAssignExamMutation } from "@/presentation/features/exam/api/examApi";

interface Student {
  id: string;
  name?: string;
  email: string;
}

interface StudentAssignPanelProps {
  examId?: string;
  initialAssignedIds?: string[];
}

export interface StudentAssignPanelRef {
  assignSelected: () => Promise<void>;
  hasSelected: boolean;
}

export const StudentAssignPanel = forwardRef<StudentAssignPanelRef, StudentAssignPanelProps>(
  ({ examId, initialAssignedIds }, ref) => {
    const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(initialAssignedIds || []));

  const [assignExam, { isLoading: isAssigning }] = useAssignExamMutation();

  useEffect(() => {
    if (initialAssignedIds && initialAssignedIds.length > 0) {
      setSelected((prev) => {
        const next = new Set(prev);
        initialAssignedIds.forEach(id => next.add(id));
        return next;
      });
    }
  }, [initialAssignedIds]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await apiRequest<Student[]>(endpoints.admin.students);
        setStudents(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load student list.");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    );
  }, [students, search]);

  const toggleAll = () => {
    const assignableStudents = filtered.filter(s => !initialAssignedIds?.includes(s.id));
    const allAssignableSelected = assignableStudents.every(s => selected.has(s.id));
    
    if (allAssignableSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        assignableStudents.forEach(s => next.delete(s.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        assignableStudents.forEach(s => next.add(s.id));
        return next;
      });
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAssign = async () => {
    if (!examId || selected.size === 0) return;
    try {
      await assignExam({
        examId,
        studentIds: [...selected],
      }).unwrap();
      toast.success(`Exam successfully assigned!`);
    } catch {
      toast.error("Failed to assign exam. Please try again.");
      throw new Error("Assignment failed"); // throw to let caller know
    }
  };

  useImperativeHandle(ref, () => ({
    assignSelected: handleAssign,
    hasSelected: selected.size > 0,
  }));

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-base font-semibold text-foreground">
          Assign Exam to Students
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Select students to assign this exam to. Assignment will be available after creation.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          id="student-search-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          aria-label="Search students"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-muted/20 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[var(--primary)]/60 transition"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="px-4 py-3 w-10">
                  <button
                    id="select-all-students-btn"
                    onClick={toggleAll}
                    aria-label={allSelected ? "Deselect all students" : "Select all students"}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {allSelected ? (
                      <CheckSquare className="h-4 w-4 text-[var(--primary)]" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                {["Name", "Email"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-4 w-4 rounded bg-white/[0.06]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-32 rounded bg-white/[0.06]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-48 rounded bg-white/[0.06]" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center">
                    <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {search ? "No students match your search" : "No students found"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const isSel = selected.has(s.id);
                  const isAlreadyAssigned = initialAssignedIds?.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => !isAlreadyAssigned && toggle(s.id)}
                      className={`border-b border-border transition-colors duration-100 ${
                        isAlreadyAssigned ? "bg-[var(--primary)]/10 cursor-default" : 
                        isSel ? "bg-[var(--primary)]/5 cursor-pointer" : "hover:bg-muted/10 cursor-pointer"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className={isAlreadyAssigned ? "text-[var(--primary)]/60" : "text-[var(--primary)]"}>
                          {isSel ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {s.name || "—"} 
                        {isAlreadyAssigned && (
                          <span className="ml-2 text-[10px] font-bold bg-[var(--primary)]/20 text-[var(--primary)] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            Assigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{s.email}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected.size > 0 && (
        <p className="text-xs font-semibold text-[var(--primary)]">
          {selected.size} student{selected.size !== 1 ? "s" : ""} selected
        </p>
      )}



      {selected.size > 0 && (
        <button
          id="assign-students-btn"
          onClick={handleAssign}
          disabled={isAssigning}
          aria-label="Assign exam to selected students"
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--gradient-primary)" }}
        >
          {isAssigning ? "Assigning..." : `Assign to ${selected.size} Student${selected.size !== 1 ? "s" : ""}`}
        </button>
      )}
    </div>
  );
});
