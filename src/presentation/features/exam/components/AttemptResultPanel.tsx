/**
 * AttemptResultPanel.tsx
 * Post-submission result view shown on the exam attempt page.
 * Shows score, pass/fail, and per-question review breakdown.
 */
import { CheckCircle2, XCircle, BookOpen, ArrowLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AttemptResult } from "@/presentation/features/exam/api/examApi";

interface AttemptResultPanelProps {
  result: AttemptResult;
}

export function AttemptResultPanel({ result }: AttemptResultPanelProps) {
  const navigate = useNavigate();
  const percent = result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Score card */}
        <div
          className={`rounded-2xl border p-8 text-center space-y-4 shadow-2xl ${
            result.isPassed
              ? "border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/10"
              : "border-rose-500/30 bg-rose-500/5 shadow-rose-500/10"
          }`}
        >
          <div
            className={`mx-auto h-16 w-16 rounded-full grid place-items-center ${
              result.isPassed ? "bg-emerald-500/20" : "bg-rose-500/20"
            }`}
          >
            {result.isPassed ? (
              <Trophy className="h-8 w-8 text-emerald-400" />
            ) : (
              <XCircle className="h-8 w-8 text-rose-400" />
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {result.isPassed ? "🎉 Exam Submitted!" : "Exam Submitted"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.isPassed ? "Congratulations! You passed." : "Better luck next time."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="font-display text-4xl font-bold text-foreground">
                {result.score}
                <span className="text-2xl text-muted-foreground">/{result.totalMarks}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">Your Score</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <p
                className={`font-display text-2xl font-bold ${
                  result.isPassed ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {percent}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">Percentage</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <p className="font-display text-2xl font-bold text-muted-foreground">
                {result.passMarks}
              </p>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">Pass Mark</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {result.isPassed ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-4 py-1.5 text-sm font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> PASSED
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 border border-rose-500/30 px-4 py-1.5 text-sm font-bold text-rose-300">
                <XCircle className="h-4 w-4" /> FAILED
              </span>
            )}
          </div>
        </div>

        {/* Per-question review */}
        {result.answers && result.answers.length > 0 && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="font-semibold text-sm text-foreground">Detailed Review</h2>
            </div>
            <div className="divide-y divide-border">
              {result.answers.map((ans, i) => {
                const q = ans.question;
                const correctOption = q?.options.find((o) => o.isCorrect);
                const chosenOption = q?.options.find((o) => o.id === ans.selectedOptionId);
                const isCorrect = ans.isCorrect;

                return (
                  <div key={ans.questionId} className="px-5 py-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`shrink-0 h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold ${
                          isCorrect
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <p className="text-sm font-medium text-foreground leading-snug">
                        Q{i + 1}. {q?.text || ans.questionId}
                      </p>
                    </div>

                    <div className="ml-9 space-y-1.5">
                      {chosenOption && (
                        <div
                          className={`text-xs rounded-lg px-3 py-2 border ${
                            isCorrect
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
                          }`}
                        >
                          <span className="font-semibold">Your answer: </span>
                          {chosenOption.text}
                        </div>
                      )}
                      {!isCorrect && correctOption && (
                        <div className="text-xs rounded-lg px-3 py-2 border bg-emerald-500/10 border-emerald-500/20 text-emerald-300">
                          <span className="font-semibold">Correct answer: </span>
                          {correctOption.text}
                        </div>
                      )}
                      {!ans.selectedOptionId && (
                        <div className="text-xs text-muted-foreground italic">Not answered</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            id="result-back-to-exams-btn"
            onClick={() => navigate("/student/exams")}
            aria-label="Back to exam list"
            className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-150"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </button>
        </div>
      </div>
    </main>
  );
}
