/**
 * SubmissionModal.tsx
 * Pre-submit summary dialog for the exam attempt page.
 */
import { useState, useEffect } from "react";
import { CheckCircle2, Flag, Circle, AlertTriangle, RefreshCw, ClipboardCheck } from "lucide-react";

interface SubmissionModalProps {
  open: boolean;
  answeredCount: number;
  flaggedCount: number;
  unansweredCount: number;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SubmissionModal({
  open,
  answeredCount,
  flaggedCount,
  unansweredCount,
  isSubmitting,
  onConfirm,
  onCancel,
}: SubmissionModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [open]);

  if (!open) return null;

  const hasWarnings = flaggedCount > 0 || unansweredCount > 0;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isSubmitting ? onCancel : undefined}
        aria-hidden="true"
      />

      <div
        className={`relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl transition-all duration-200 ${
          visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <div className="h-1 rounded-t-2xl" style={{ background: "var(--gradient-primary)" }} />

        <div className="p-6 space-y-5">
          {/* Icon + title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center bg-[var(--primary)]/10">
              <ClipboardCheck className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <h2 id="submission-modal-title" className="font-display text-lg font-bold text-foreground">
              Submit Exam
            </h2>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Summary
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Answered
              </span>
              <span className="font-bold text-foreground">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-amber-300">
                <Flag className="h-4 w-4" /> Flagged
              </span>
              <span className="font-bold text-foreground">{flaggedCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Circle className="h-4 w-4" /> Unanswered
              </span>
              <span className="font-bold text-foreground">{unansweredCount}</span>
            </div>
          </div>

          {/* Warning */}
          {hasWarnings && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                You have {flaggedCount > 0 ? `${flaggedCount} flagged` : ""}
                {flaggedCount > 0 && unansweredCount > 0 ? " and " : ""}
                {unansweredCount > 0 ? `${unansweredCount} unanswered` : ""} question(s). Are you sure you want to submit?
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              id="submission-cancel-btn"
              onClick={onCancel}
              disabled={isSubmitting}
              aria-label="Cancel submission"
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="submission-confirm-btn"
              onClick={onConfirm}
              disabled={isSubmitting}
              aria-label="Submit the exam"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Final →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
