/**
 * StudentExamsPage.tsx
 * Student-facing exam listing page with course-filtered exam cards.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import { useGetExamsByCourseQuery } from "@/presentation/features/exam/api/examApi";
import { ExamCard } from "@/presentation/features/exam/components/ExamCard";
import { StartExamDialog } from "@/presentation/features/exam/components/StartExamDialog";
import type { Exam } from "@/presentation/features/exam/api/examApi";

// Hard-coded sample course IDs — in production, fetch from enrolled courses
const SAMPLE_COURSES = [
  { id: "all", label: "All Courses" },
];

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card animate-pulse overflow-hidden">
      <div className="h-1 bg-white/[0.04]" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="h-5 w-20 rounded-full bg-white/[0.06]" />
          <div className="h-4 w-10 rounded-full bg-white/[0.04]" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded bg-white/[0.06]" />
          <div className="h-3 w-full rounded bg-white/[0.04]" />
          <div className="h-3 w-2/3 rounded bg-white/[0.04]" />
        </div>
        <div className="flex gap-4">
          <div className="h-3 w-16 rounded bg-white/[0.04]" />
          <div className="h-3 w-16 rounded bg-white/[0.04]" />
        </div>
        <div className="h-9 rounded-lg bg-white/[0.06]" />
      </div>
    </div>
  );
}

export function StudentExamsPage() {
  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState(SAMPLE_COURSES[0].id);
  const [dialogExam, setDialogExam] = useState<Exam | null>(null);

  const { data: exams, isLoading, isError, refetch } = useGetExamsByCourseQuery(selectedCourseId);

  const displayExams = exams ?? [];

  const handleStarted = (examId: string, attemptId: string) => {
    setDialogExam(null);
    navigate(`/student/exams/${examId}/attempt/${attemptId}`);
  };

  return (
    <main className="flex-1 px-4 pb-8 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight md:text-3xl font-display">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
              <ClipboardCheck className="h-5 w-5 text-[var(--primary)]" />
            </div>
            My Exams
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            View and take your assigned exams.
          </p>
        </div>

        <button
          id="refresh-exams-btn"
          onClick={() => refetch()}
          disabled={isLoading}
          aria-label="Refresh exam list"
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Course filter */}
      <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl border border-border bg-card">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Filter by Course:
        </span>
        {SAMPLE_COURSES.map((c) => (
          <button
            key={c.id}
            id={`course-filter-${c.id}`}
            onClick={() => setSelectedCourseId(c.id)}
            aria-pressed={selectedCourseId === c.id}
            aria-label={`Filter by ${c.label}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedCourseId === c.id
                ? "bg-[var(--primary)]/10 border-[var(--primary)]/40 text-[var(--primary)]"
                : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-3 animate-pulse" />
          <h3 className="font-semibold text-lg">Unable to load exams</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Could not reach the exam service. Check your network and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted/20 transition"
          >
            Retry
          </button>
        </div>
      ) : displayExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-border text-center">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-lg text-foreground/80">No exams available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            No exams have been published for this course yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onStart={(e) => setDialogExam(e)}
            />
          ))}
        </div>
      )}

      {/* Start dialog */}
      <StartExamDialog
        exam={dialogExam}
        onClose={() => setDialogExam(null)}
        onStarted={handleStarted}
      />
    </main>
  );
}
