/**
 * InstructorExamsPage.tsx
 * Exam management list page for instructors (and reused by admin portal).
 */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useGetExamsByCourseQuery, useDeleteExamMutation } from "@/presentation/features/exam/api/examApi";
import type { Exam } from "@/presentation/features/exam/api/examApi";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";

// For a real implementation, pass a courseId from context or URL params.
const PLACEHOLDER_COURSE_ID = "all";

function StatusBadge({ status }: { status: Exam["status"] }) {
  const config = {
    PUBLISHED: { label: "Published", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
    DRAFT: { label: "Draft", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    ARCHIVED: { label: "Archived", cls: "bg-muted/50 text-muted-foreground border-border" },
  }[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${config.cls}`}
    >
      {config.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 w-full rounded bg-white/[0.06]" />
        </td>
      ))}
    </tr>
  );
}

export function InstructorExamsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role === "ADMIN" ? "admin" : "instructor";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Exam["status"]>("ALL");

  const { data: exams, isLoading, isError, refetch } = useGetExamsByCourseQuery(PLACEHOLDER_COURSE_ID);

  const [deleteExam, { isLoading: isDeleting }] = useDeleteExamMutation();

  const allExams: Exam[] = exams ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allExams.filter((e) => {
      const matchSearch = !q || e.title.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allExams, search, statusFilter]);

  const handleDelete = async (exam: Exam) => {
    const confirmed = window.confirm(`Delete exam "${exam.title}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteExam(exam.id).unwrap();
      toast.success(`Exam "${exam.title}" deleted.`);
    } catch {
      toast.error("Failed to delete exam.");
    }
  };

  return (
    <main className="flex-1 px-4 pb-8 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-5 border-b border-border">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight md:text-3xl font-display">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
              <ClipboardCheck className="h-5 w-5 text-[var(--primary)]" />
            </div>
            Exam Management
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Create, publish, and manage exams for your courses.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="refresh-exams-btn"
            onClick={() => refetch()}
            disabled={isLoading}
            aria-label="Refresh exam list"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            id="create-exam-btn"
            onClick={() => navigate(`/${role}/exams/create`)}
            aria-label="Create a new exam"
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4" />
            Create Exam
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-border bg-card">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="exam-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams…"
            aria-label="Search exams"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted/20 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-[var(--primary)]/50 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/10 p-1">
          {(["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"] as const).map((s) => (
            <button
              key={s}
              id={`filter-${s.toLowerCase()}`}
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
              aria-label={`Filter by status: ${s}`}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === s
                  ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <AlertCircle className="h-10 w-10 text-rose-500 animate-pulse" />
            <p className="font-semibold">Failed to load exams</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Could not reach the exam service. Make sure it is running.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 rounded-lg border border-border px-4 py-2 text-xs text-foreground hover:bg-muted/20 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-white/[0.02]">
                  {["Title", "Questions", "Attempts", "Total Marks", "Status", "Created", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-14 w-14 rounded-full grid place-items-center bg-[var(--primary)]/10">
                          <FileText className="h-7 w-7 text-[var(--primary)]/60" />
                        </div>
                        <p className="font-semibold text-foreground">
                          {search || statusFilter !== "ALL"
                            ? "No exams match your filter"
                            : "No exams yet"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {search || statusFilter !== "ALL"
                            ? "Try adjusting your search or filters."
                            : "Create your first exam to get started."}
                        </p>
                        {!search && statusFilter === "ALL" && (
                          <button
                            onClick={() => navigate(`/${role}/exams/create`)}
                            className="mt-2 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            <Plus className="h-4 w-4" />
                            Create your first exam →
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((exam) => (
                    <tr
                      key={exam.id}
                      className="group border-b border-border transition hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">
                          {exam.title}
                        </p>
                        {exam.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {exam.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {exam._count?.questions ?? exam.questions?.length ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {exam._count?.attempts ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {exam.totalMarks}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={exam.status} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(exam.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`view-exam-${exam.id}`}
                            onClick={() => navigate(`/${role}/exams/${exam.id}/edit`)}
                            aria-label={`View details of ${exam.title}`}
                            className="p-1.5 rounded-lg border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30 transition"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            id={`edit-exam-${exam.id}`}
                            onClick={() => navigate(`/${role}/exams/${exam.id}/edit`)}
                            aria-label={`Edit ${exam.title}`}
                            className="p-1.5 rounded-lg border border-transparent text-muted-foreground hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            id={`delete-exam-${exam.id}`}
                            onClick={() => handleDelete(exam)}
                            disabled={isDeleting}
                            aria-label={`Delete ${exam.title}`}
                            className="p-1.5 rounded-lg border border-transparent text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-40"
                          >
                            {isDeleting ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && !isError && filtered.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground">
          Showing <span className="text-foreground font-semibold">{filtered.length}</span> of{" "}
          <span className="text-foreground font-semibold">{allExams.length}</span> exams
        </p>
      )}
    </main>
  );
}
