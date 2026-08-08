import { ChevronRight, ChevronLeft, Save, RefreshCw } from "lucide-react";

interface ExamBuilderFooterProps {
  step: number;
  totalSteps: number;
  isSubmitting: boolean;
  isValid: boolean;
  isEditing: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onNext: () => void;
  onCreateOrUpdate: () => void;
  onFinish: () => void;
}

export function ExamBuilderFooter({
  step,
  totalSteps,
  isSubmitting,
  isValid,
  isEditing,
  onBack,
  onSaveDraft,
  onNext,
  onCreateOrUpdate,
  onFinish,
}: ExamBuilderFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-5 pb-2">
      <button
        id="wizard-back-btn"
        onClick={onBack}
        aria-label={step === 0 ? "Cancel and go back to exam list" : "Go to previous step"}
        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-150"
      >
        <ChevronLeft className="h-4 w-4" />
        {step === 0 ? "Cancel" : "Back"}
      </button>

      <div className="flex items-center gap-3">
        {/* Save Draft */}
        {step < totalSteps - 1 && (
          <button
            id="save-draft-btn"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            aria-label="Save as draft"
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors duration-150 disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </button>
        )}

        {/* Next */}
        {step < 2 && (
          <button
            id="wizard-next-btn"
            onClick={onNext}
            aria-label="Continue to next step"
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            style={{ background: "var(--gradient-primary)" }}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Create / Update */}
        {step === 2 && (
          <button
            id="wizard-create-exam-btn"
            onClick={onCreateOrUpdate}
            disabled={isSubmitting}
            aria-label={isEditing ? "Update exam" : "Create exam"}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                {isEditing ? "Update Exam" : "Create Exam"}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}

        {/* Finish */}
        {step === 3 && (
          <button
            id="wizard-finish-btn"
            onClick={onFinish}
            aria-label="Finish and go to exam list"
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            Finish
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
