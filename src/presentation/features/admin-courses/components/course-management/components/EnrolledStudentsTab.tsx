import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2, Video, FileText, HelpCircle, BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle, ChevronsUpDown, ChevronsDownUp, Upload, TerminalSquare, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { User } from "@/domain/user";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";

export function EnrolledStudentsTab({
  courseId,
  allStudents,
  onEnrollSuccess,
}: {
  courseId: string;
  allStudents: User[];
  onEnrollSuccess: () => void;
}) {
  const [enrolled, setEnrolled] = useState<{ id: string; studentId: string; name: string; email: string; purchasedAt: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const fetchEnrolled = useCallback(() => {
    let active = true;
    setIsLoading(true);
    managementService
      .getEnrolledStudents(courseId)
      .then((data: any[]) => {
        if (!active) return;
        const mapped = data.map((item) => ({
          id: item.id,
          studentId: item.studentId || item.student?.id || "",
          name: item.student?.name || "Unknown Student",
          email: item.student?.email || "",
          purchasedAt: item.purchasedAt,
        }));
        setEnrolled(mapped);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load enrolled students:", err);
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  useEffect(() => {
    const cleanup = fetchEnrolled();
    return cleanup;
  }, [fetchEnrolled]);

  const availableStudents = useMemo(() => {
    const enrolledIds = new Set(enrolled.map((e) => e.studentId));
    return allStudents.filter((s) => !enrolledIds.has(s.id));
  }, [allStudents, enrolled]);

  const filteredAvailable = useMemo(() => {
    return availableStudents.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableStudents, searchQuery]);

  const toggleStudentSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleEnroll = async () => {
    if (selectedIds.length === 0) return;
    setIsEnrolling(true);
    try {
      for (const studentId of selectedIds) {
        await managementService.enrollStudent({ studentId, courseId });
      }
      toast.success(`Successfully enrolled ${selectedIds.length} student(s)!`);
      setSelectedIds([]);
      setSearchQuery("");
      setShowAddPanel(false);
      fetchEnrolled();
      onEnrollSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to enroll some students.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <span className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin animate-infinite" />
        <p className="text-xs text-muted-foreground mt-2">Loading enrolled students...</p>
      </div>
    );
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm text-foreground">Student Roster</h3>
        <button
          onClick={() => setShowAddPanel(!showAddPanel)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition cursor-pointer"
        >
          {showAddPanel ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showAddPanel ? "Close Panel" : "Assign Students"}
        </button>
      </div>

      {showAddPanel && (
        <div className="p-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email to assign..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500 transition text-foreground"
            />
          </div>

          <div className="border border-[var(--hairline)] rounded-lg bg-[var(--surface)] max-h-[200px] overflow-y-auto p-1.5 space-y-1">
            {filteredAvailable.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                {searchQuery ? "No matching students found." : "All students are already enrolled."}
              </div>
            ) : (
              filteredAvailable.map((student) => {
                const isSelected = selectedIds.includes(student.id);
                return (
                  <div
                    key={student.id}
                    onClick={() => toggleStudentSelection(student.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition select-none ${
                      isSelected
                        ? "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                        : "hover:bg-[var(--surface-2)] border border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-muted-foreground/50 bg-[var(--surface-2)]"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3px]" />}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {student.name || "Unnamed Student"}
                      </div>
                      <div className="text-[10px] opacity-70 truncate">{student.email}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-muted-foreground">
              Selected: <span className="font-bold text-foreground font-mono">{selectedIds.length}</span>
            </span>
            <button
              onClick={handleEnroll}
              disabled={selectedIds.length === 0 || isEnrolling}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs text-white bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer"
            >
              {isEnrolling ? "Assigning..." : "Assign Selected"}
            </button>
          </div>
        </div>
      )}

      {enrolled.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[var(--hairline)] rounded-xl bg-background/20">
          <Users className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {enrolled.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-lg border border-[var(--hairline)] bg-background/40 px-3 py-3"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-xs font-bold text-primary-foreground">
                {s.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">{s.email}</p>
              </div>
              <p className="text-[11px] text-muted-foreground shrink-0">
                {new Date(s.purchasedAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}