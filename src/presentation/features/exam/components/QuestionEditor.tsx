/**
 * QuestionEditor.tsx
 * Right panel of the Exam Builder for editing a single question.
 */
import { useEffect, useRef } from "react";
import { Trash2, Plus, AlertTriangle } from "lucide-react";
import type { QuestionDraft } from "./QuestionList";

interface QuestionEditorProps {
  question: QuestionDraft;
  examType: string;
  questionIndex: number;
  isSameMark: boolean;
  onChange: (updated: QuestionDraft) => void;
}

export function QuestionEditor({ question, examType, questionIndex, isSameMark, onChange }: QuestionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question.text]);

  const updateText = (text: string) => onChange({ ...question, text });
  const updateHint = (hint: string) => onChange({ ...question, hint });
  const updateMarks = (marks: number) => onChange({ ...question, marks });
  const updateOptional = (optional: boolean) => onChange({ ...question, optional });

  const setCorrect = (optId: string) => {
    onChange({
      ...question,
      options: question.options.map((o) => ({ ...o, isCorrect: o.id === optId })),
    });
  };

  const updateOptionText = (optId: string, text: string) => {
    onChange({
      ...question,
      options: question.options.map((o) => (o.id === optId ? { ...o, text } : o)),
    });
  };

  const removeOption = (optId: string) => {
    if (question.options.length <= 2) return;
    onChange({ ...question, options: question.options.filter((o) => o.id !== optId) });
  };

  const addOption = () => {
    if (question.options.length >= 6) return;
    onChange({
      ...question,
      options: [
        ...question.options,
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ],
    });
  };

  const hasCorrect = question.options.some((o) => o.isCorrect);

  const updateCorrectAnswerText = (text: string) => {
    onChange({ ...question, correctAnswerText: text });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 py-3 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Editing Question {questionIndex + 1}
        </p>
      </div>

      <div className="flex-1 p-5 space-y-5">
        {/* Question text */}
        <div className="space-y-1.5">
          <label
            htmlFor={`q-text-${question.id}`}
            className="text-xs font-semibold text-foreground"
          >
            Question Text <span className="text-rose-400">*</span>
          </label>
          <textarea
            id={`q-text-${question.id}`}
            ref={textareaRef}
            value={question.text}
            onChange={(e) => updateText(e.target.value)}
            rows={2}
            placeholder="Enter your question here…"
            aria-label="Question text"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                document.getElementById(`opt-input-${question.options[0]?.id}`)?.focus();
              }
            }}
            className="w-full resize-none rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[var(--primary)]/60 focus:ring-1 focus:ring-[var(--primary)]/20 transition min-h-[64px]"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`q-hint-${question.id}`}
            className="text-xs font-semibold text-foreground"
          >
            Hint <span className="text-muted-foreground font-normal">(Optional)</span>
          </label>
          <input
            id={`q-hint-${question.id}`}
            type="text"
            value={question.hint || ""}
            onChange={(e) => updateHint(e.target.value)}
            placeholder="Add a hint to help students…"
            aria-label="Question hint"
            className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[var(--primary)]/60 transition"
          />
        </div>

        {/* Settings */}
        <div className="flex items-center gap-8">
          {!isSameMark && (
            <div className="space-y-1.5">
              <label htmlFor={`q-marks-${question.id}`} className="text-xs font-semibold text-foreground">
                Marks
              </label>
              <input
                id={`q-marks-${question.id}`}
                type="number"
                min={1}
                value={question.marks}
                onChange={(e) => updateMarks(Math.max(1, parseInt(e.target.value) || 1))}
                aria-label="Question marks"
                className="w-20 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--primary)]/60 transition"
              />
            </div>
          )}

          <div className="flex items-center gap-3 self-end py-2">
            <span className="text-xs font-semibold text-foreground">
              {question.optional ? "Optional Question" : "Mandatory Question"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={!question.optional}
              onClick={() => updateOptional(!question.optional)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-background ${
                !question.optional ? 'bg-[var(--primary)]' : 'bg-muted'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  !question.optional ? 'translate-x-2' : '-translate-x-2'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Options / Answer */}
        <div className="space-y-2">
          {examType === "QUIZZ" ? (
            <div className="space-y-1.5">
              <label htmlFor={`q-answer-${question.id}`} className="text-xs font-semibold text-foreground">
                Correct Answer Text <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <textarea
                id={`q-answer-${question.id}`}
                value={question.correctAnswerText || ""}
                onChange={(e) => updateCorrectAnswerText(e.target.value)}
                rows={3}
                placeholder="Enter the required text answer..."
                aria-label="Correct answer text"
                className="w-full resize-none rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[var(--primary)]/60 focus:ring-1 focus:ring-[var(--primary)]/20 transition min-h-[64px]"
              />
              <p className="text-[10px] text-muted-foreground">
                Providing this text enables auto-grading (students must match it exactly, case-insensitive). Omitting this sets the question for manual evaluation.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Answer Options <span className="text-rose-400">*</span>
                </label>
            <span className="text-[10px] text-muted-foreground">
              Click a radio to mark correct
            </span>
          </div>

          {!hasCorrect && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Mark one option as correct
            </div>
          )}

          <div className="space-y-2">
            {question.options.map((opt, oi) => (
              <div
                key={opt.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-150 ${
                  opt.isCorrect
                    ? "border-l-4 border-emerald-500 bg-emerald-500/10"
                    : "border-border bg-card hover:bg-white/[0.04]"
                }`}
              >
                <button
                  type="button"
                  id={`opt-radio-${opt.id}`}
                  onClick={() => setCorrect(opt.id)}
                  aria-label={`Mark option ${oi + 1} as correct`}
                  aria-pressed={opt.isCorrect}
                  className={`shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    opt.isCorrect
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-muted-foreground hover:border-[var(--primary)]"
                  }`}
                >
                  {opt.isCorrect && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </button>

                <div className={`shrink-0 h-6 w-6 rounded flex items-center justify-center text-[11px] font-bold ${
                  opt.isCorrect
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-muted/50 text-muted-foreground"
                }`}>
                  {String.fromCharCode(65 + oi)}
                </div>

                <input
                  id={`opt-input-${opt.id}`}
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOptionText(opt.id, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                  aria-label={`Option ${String.fromCharCode(65 + oi)} text`}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                />

                <button
                  type="button"
                  id={`remove-opt-${opt.id}`}
                  onClick={() => removeOption(opt.id)}
                  disabled={question.options.length <= 2}
                  aria-label={`Remove option ${oi + 1}`}
                  className="shrink-0 h-5 w-5 rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {question.options.length < 6 && (
            <button
              type="button"
              id={`add-option-btn-${question.id}`}
              onClick={addOption}
              aria-label="Add another option"
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-[var(--primary)]/40 transition-colors duration-150"
            >
              <Plus className="h-3 w-3" />
              Add Option
            </button>
          )}
          {question.options.length < 2 && (
            <p className="text-[11px] text-rose-400">Minimum 2 options required</p>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
