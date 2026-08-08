/**
 * StudentExamAttemptPage.tsx
 * Full-screen exam attempt interface.
 * Hides the portal sidebar/topbar by wrapping outside PortalLayout.
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  RefreshCw,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useGetExamDetailsQuery, useSubmitAttemptMutation, useGetAttemptResultQuery } from "@/presentation/features/exam/api/examApi";
import { useExamTimer } from "@/presentation/features/exam/hooks/useExamTimer";
import { useExamAttempt } from "@/presentation/features/exam/hooks/useExamAttempt";
import { QuestionNavigator } from "@/presentation/features/exam/components/QuestionNavigator";
import { SubmissionModal } from "@/presentation/features/exam/components/SubmissionModal";
import { AttemptResultPanel } from "@/presentation/features/exam/components/AttemptResultPanel";

export function StudentExamAttemptPage() {
  const { examId, attemptId } = useParams<{ examId: string; attemptId: string }>();
  const navigate = useNavigate();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: exam, isLoading: examLoading, isError } = useGetExamDetailsQuery(examId!, {
    skip: !examId,
  });

  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitAttemptMutation();
  const { data: result } = useGetAttemptResultQuery(attemptId!, {
    skip: !submitted || !attemptId,
  });

  const questions = exam?.questions ?? [];
  const questionIds = questions.map((q) => q.id);

  const {
    currentIndex,
    answers,
    selectOption,
    toggleFlag,
    clearAllFlags,
    goTo,
    goNext,
    goPrev,
    answeredCount,
    flaggedCount,
    unansweredCount,
    attemptData,
  } = useExamAttempt({
    attemptId: attemptId!,
    totalQuestions: questions.length,
  });

  const handleAutoSubmit = useCallback(async () => {
    toast.warning("⏱ Time's up! Finalizing and submitting your exam…");
    try {
      await clearAllFlags();
      await submitAttempt(attemptId!).unwrap();
      setSubmitted(true);
    } catch {
      toast.error("Auto-submit failed. Please submit manually.");
    }
  }, [attemptId, submitAttempt, clearAllFlags]);

  const { formattedTime, isWarning, isCritical } = useExamTimer({
    durationMin: exam?.durationMin ?? 60,
    startedAt: attemptData?.startedAt,
    onExpire: handleAutoSubmit,
  });

  const handleConfirmSubmit = async () => {
    try {
      await submitAttempt(attemptId!).unwrap();
      setSubmitted(true);
      setShowSubmitModal(false);
    } catch {
      toast.error("Failed to submit exam. Please try again.");
    }
  };

  // Lock body scroll during exam
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Show result after submission
  if (submitted && result) {
    return <AttemptResultPanel result={result} />;
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-[var(--primary)] animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your results…</p>
        </div>
      </div>
    );
  }

  if (examLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-[var(--primary)] animate-spin" />
          <p className="text-sm text-muted-foreground">Loading exam…</p>
        </div>
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <p className="font-semibold">Failed to load exam</p>
          <button
            onClick={() => navigate("/student/exams")}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted/20 transition"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ── Topbar ──────────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-border bg-card px-4 py-3 flex items-center gap-4">
        {/* Title + progress */}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-sm font-bold text-foreground truncate">{exam.title}</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {answeredCount} / {questions.length} answered
          </p>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:block flex-1 max-w-[200px]">
          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPct}%`,
                background: "var(--gradient-primary)",
              }}
            />
          </div>
        </div>

        {/* Timer */}
        <div
          className={`font-mono text-base font-bold px-3 py-1.5 rounded-lg border transition-all duration-150 ${
            isCritical
              ? "text-red-400 border-red-500/30 bg-red-500/10 animate-pulse"
              : isWarning
              ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
              : "text-foreground border-border bg-card"
          }`}
          aria-label={`Time remaining: ${formattedTime}`}
        >
          {formattedTime}
        </div>

        {/* Submit */}
        <button
          id="open-submit-modal-btn"
          onClick={() => setShowSubmitModal(true)}
          aria-label="Submit exam"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97] shrink-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Send className="h-3.5 w-3.5" />
          Submit
        </button>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Question panel */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {currentQuestion ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Q index */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                {currentAnswer?.saving === "saving" && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving…
                  </span>
                )}
                {currentAnswer?.saving === "saved" && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <Check className="h-3 w-3" />
                    Saved
                  </span>
                )}
              </div>

              {/* Question text */}
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-base font-semibold text-foreground leading-relaxed">
                  {currentQuestion.text}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  <span>{currentQuestion.marks} mark{currentQuestion.marks !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt, oi) => {
                  const isSelected = currentAnswer?.selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      id={`option-${opt.id}`}
                      onClick={() => selectOption(currentQuestion.id, opt.id)}
                      aria-pressed={isSelected}
                      aria-label={`Option ${oi + 1}: ${opt.text}`}
                      className={`w-full flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-150 cursor-pointer
                        ${
                          isSelected
                            ? "border-l-4 border-[var(--primary)] bg-[var(--primary)]/10 shadow-[0_0_20px_-6px_var(--primary)]"
                            : "border-border bg-card hover:bg-white/[0.04] hover:border-[var(--primary)]/30"
                        }`}
                    >
                      <span
                        className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary)]"
                            : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Flag button */}
              <button
                id="flag-question-btn"
                onClick={() => toggleFlag(currentQuestion.id)}
                aria-pressed={!!currentAnswer?.isFlagged}
                aria-label={currentAnswer?.isFlagged ? "Remove flag from this question" : "Flag this question for review"}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-all duration-150 ${
                  currentAnswer?.isFlagged
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    : "border-border text-muted-foreground hover:border-amber-500/40 hover:text-amber-300"
                }`}
              >
                <Flag className={`h-3.5 w-3.5 ${currentAnswer?.isFlagged ? "fill-amber-400" : ""}`} />
                {currentAnswer?.isFlagged ? "Flagged for Review" : "Flag for Review"}
              </button>

              {/* Prev / Next */}
              <div className="flex items-center justify-between pt-2">
                <button
                  id="prev-question-btn"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  aria-label="Previous question"
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  id="next-question-btn"
                  onClick={goNext}
                  disabled={currentIndex === questions.length - 1}
                  aria-label="Next question"
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No questions found in this exam.
            </div>
          )}
        </div>

        {/* Navigator sidebar */}
        <aside className="hidden lg:flex w-56 shrink-0 border-l border-border bg-card/50 p-4 flex-col overflow-y-auto">
          <QuestionNavigator
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answers={answers}
            questionIds={questionIds}
            onNavigate={goTo}
          />
        </aside>
      </div>

      {/* Submit modal */}
      <SubmissionModal
        open={showSubmitModal}
        answeredCount={answeredCount}
        flaggedCount={flaggedCount}
        unansweredCount={unansweredCount}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
