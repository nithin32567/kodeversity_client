/**
 * StartExamDialog.tsx
 * Confirmation dialog shown before starting an exam attempt.
 * Uses native dialog pattern (no shadcn dependency needed).
 */
import { useState, useEffect } from "react";
import { Clock, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { useStartExamMutation } from "@/presentation/features/exam/api/examApi";
import { toast } from "sonner";
import type { Exam } from "@/presentation/features/exam/api/examApi";

interface StartExamDialogProps {
  exam: Exam | null;
  onClose: () => void;
  onStarted: (examId: string, attemptId: string) => void;
}

export function StartExamDialog({ exam, onClose, onStarted }: StartExamDialogProps) {
  const [startExam, { isLoading }] = useStartExamMutation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (exam) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [exam]);

  if (!exam) return null;

  const handleStart = async () => {
    try {
      const attempt = await startExam(exam.id).unwrap();
      const actualAttemptId = (attempt as any).attemptId || attempt.id;
      onStarted(exam.id, actualAttemptId);
    } catch (err: any) {
      console.error("Start Exam Error:", err);
      const attemptId = err?.data?.attemptId || err?.data?.data?.attemptId;
      
      if (err?.status === 409 && attemptId) {
        toast.info("Resuming your active attempt...");
        onStarted(exam.id, attemptId);
      } else {
        const errorMsg = err?.message || err?.data?.error || err?.error || "Failed to start the exam. Please try again.";
        toast.error(errorMsg);
      }
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-exam-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl transition-all duration-200 ${
          visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Top accent */}
        <div className="h-1 rounded-t-2xl" style={{ background: "var(--gradient-primary)" }} />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div>
            <h2
              id="start-exam-dialog-title"
              className="font-display text-xl font-bold text-foreground"
            >
              Ready to begin?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{exam.title}</p>
          </div>

          {/* Info grid */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-lg bg-[var(--primary)]/10 grid place-items-center shrink-0">
                <Clock className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{exam.durationMin} minutes</p>
                <p className="text-xs text-muted-foreground">Once started, the timer cannot be paused.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 grid place-items-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Pass mark: {exam.passMarks} / {exam.totalMarks}</p>
                <p className="text-xs text-muted-foreground">You need {exam.passMarks} marks to pass.</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Make sure you have a stable internet connection before proceeding.</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              id="start-exam-cancel-btn"
              onClick={handleClose}
              disabled={isLoading}
              aria-label="Cancel and go back"
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="start-exam-confirm-btn"
              onClick={handleStart}
              disabled={isLoading}
              aria-label="Start the exam"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Starting…
                </>
              ) : (
                "Start Exam →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
