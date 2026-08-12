/**
 * ExamCard.tsx
 * Individual exam card for the student exam list page.
 */
import { Clock, FileText, CheckCircle2, Hash, Lock } from "lucide-react";
import type { Exam } from "@/presentation/features/exam/api/examApi";

interface ExamCardProps {
  exam: Exam;
  onStart: (exam: Exam) => void;
}

function StatusBadge({ status }: { status: Exam["status"] }) {
  const config = {
    PUBLISHED: {
      label: "Published",
      cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    DRAFT: {
      label: "Draft",
      cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    ARCHIVED: {
      label: "Archived",
      cls: "bg-muted/50 text-muted-foreground border-border",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.cls}`}
    >
      {config.label}
    </span>
  );
}

export function ExamCard({ exam, onStart }: ExamCardProps) {
  const isPublished = exam.status === "PUBLISHED";
  const questionCount = exam._count?.questions ?? exam.questions?.length ?? 0;
  
  const maxAttempts = exam.maxAttempts ?? 1;
  const studentAttempts = exam.studentAttemptCount ?? 0;
  const isMaxReached = studentAttempts >= maxAttempts;
  const canStart = isPublished && !isMaxReached;

  return (
    <article
      className="group relative flex flex-col rounded-xl border border-border bg-card transition-all duration-200 overflow-hidden
        hover:border-[var(--primary)]/40 hover:shadow-[0_0_32px_-8px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: isPublished ? "var(--gradient-primary)" : "var(--border)" }}
      />

      <div className="flex flex-col flex-1 p-3.5 gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <StatusBadge status={exam.status} />
          {questionCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
              <Hash className="h-2.5 w-2.5" />
              {questionCount} Q
            </span>
          )}
        </div>

        {/* Title + description */}
        <div className="flex-1">
          <h3 className="font-display text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-[var(--primary)] transition-colors duration-150">
            {exam.title}
          </h3>
          {exam.description && (
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
              {exam.description}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-muted-foreground font-medium">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" />
            {exam.durationMin} min
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3 shrink-0" />
            {exam.totalMarks} marks
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
            Pass: {exam.passMarks}
          </span>
        </div>

        {/* CTA */}
        <div className="relative group/btn mt-1.5">
          {isPublished && (
            <div className="mb-1.5 text-[10px] font-medium text-muted-foreground text-center">
              Attempts: <span className={isMaxReached ? "text-rose-400 font-bold" : "text-foreground"}>{studentAttempts}</span> / {maxAttempts}
            </div>
          )}
          <button
            id={`start-exam-${exam.id}`}
            onClick={() => canStart && onStart(exam)}
            disabled={!canStart}
            aria-label={canStart ? `Start exam: ${exam.title}` : `Exam not available: ${exam.status}`}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed"
            style={
              canStart
                ? { background: "var(--gradient-primary)", color: "#fff" }
                : { background: "var(--muted)", color: "var(--muted-foreground)" }
            }
          >
            {!isPublished && <Lock className="h-3.5 w-3.5" />}
            {canStart ? "Start Exam →" : isMaxReached ? "Max Attempts Reached" : exam.status === "DRAFT" ? "Not Published" : "Archived"}
          </button>
          {!canStart && !isMaxReached && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block z-10 whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-1.5 text-[11px] text-muted-foreground shadow-xl">
              Exam is {exam.status.toLowerCase()} — not available
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
