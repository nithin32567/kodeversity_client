/**
 * QuestionNavigator.tsx
 * Sidebar grid of numbered buttons for the exam attempt page.
 * States: unanswered, answered, flagged, current.
 */
import { Flag } from "lucide-react";
import type { AnswerState } from "@/presentation/features/exam/hooks/useExamAttempt";

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Map<string, AnswerState>;
  questionIds: string[];
  onNavigate: (index: number) => void;
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answers,
  questionIds,
  onNavigate,
}: QuestionNavigatorProps) {
  const legend = [
    { label: "Current", cls: "ring-2 ring-[var(--primary)] bg-[var(--primary)]/15" },
    { label: "Answered", cls: "border-emerald-500 bg-emerald-500/10 text-emerald-300" },
    { label: "Flagged", cls: "border-amber-400 bg-amber-500/10 text-amber-300" },
    { label: "Unanswered", cls: "border-border bg-card text-muted-foreground" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Question Navigator
      </p>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const qId = questionIds[i];
          const answer = qId ? answers.get(qId) : undefined;
          const isCurrent = i === currentIndex;
          const isAnswered = !!answer?.selectedOptionId;
          const isFlagged = !!answer?.isFlagged;

          let className =
            "h-8 w-full rounded-lg border text-[11px] font-bold transition-all duration-150 flex items-center justify-center cursor-pointer relative ";

          if (isCurrent) {
            className +=
              "ring-2 ring-[var(--primary)] border-[var(--primary)] bg-[var(--primary)]/20 text-[var(--primary)] scale-105 z-10";
          } else if (isFlagged) {
            className += "border-amber-400 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20";
          } else if (isAnswered) {
            className +=
              "border-emerald-500 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20";
          } else {
            className +=
              "border-border bg-card text-muted-foreground hover:border-[var(--primary)]/50 hover:text-foreground";
          }

          return (
            <button
              key={i}
              id={`nav-q-${i + 1}`}
              onClick={() => onNavigate(i)}
              aria-label={`Go to question ${i + 1}`}
              aria-current={isCurrent ? "step" : undefined}
              className={className}
            >
              {i + 1}
              {isFlagged && (
                <Flag className="absolute -top-1 -right-1 h-2.5 w-2.5 text-amber-400 fill-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-1.5">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className={`h-3.5 w-3.5 rounded border ${l.cls} shrink-0 inline-block`} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
