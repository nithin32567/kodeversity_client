import { UseFormReturn } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { ExamTypeSelector, type ExamType } from "./ExamTypeSelector";
import { type SetupForm } from "./examBuilderConstants";

interface ExamSetupStepProps {
  form: UseFormReturn<SetupForm>;
  examType: ExamType;
  setExamType: (type: ExamType) => void;
}

export function ExamSetupStep({ form, examType, setExamType }: ExamSetupStepProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const isSameMark = watch("isSameMarkForAllQuestions");

  return (
    <form className="max-w-2xl mx-auto space-y-5" noValidate>
      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="exam-title-input" className="text-xs font-semibold text-foreground">
          Title <span className="text-rose-400">*</span>
        </label>
        <input
          id="exam-title-input"
          type="text"
          placeholder="e.g. JavaScript Fundamentals — Module 2 Quiz"
          aria-label="Exam title"
          {...register("title")}
          className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[var(--primary)]/60 transition"
        />
        {errors.title && (
          <p className="text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="exam-desc-input" className="text-xs font-semibold text-foreground">
          Description
        </label>
        <textarea
          id="exam-desc-input"
          rows={3}
          placeholder="Brief description of what this exam covers…"
          aria-label="Exam description"
          {...register("description")}
          className="w-full resize-none rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[var(--primary)]/60 transition"
        />
      </div>

      {/* Exam Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">
          Exam Type <span className="text-rose-400">*</span>
        </label>
        <ExamTypeSelector value={examType} onChange={setExamType} />
      </div>

      {/* Marking Configuration */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Marking Configuration</h3>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("isSameMarkForAllQuestions")}
            className="h-4 w-4 rounded border-border accent-[var(--primary)]"
          />
          <span className="text-sm text-foreground">
            Apply same marks for all questions
          </span>
        </label>

        {isSameMark && (
          <div className="space-y-1.5 pt-2">
            <label htmlFor="marks-per-question" className="text-xs font-semibold text-foreground">
              Marks per Question <span className="text-rose-400">*</span>
            </label>
            <input
              id="marks-per-question"
              type="number"
              min={1}
              {...register("marksPerQuestion", { valueAsNumber: true })}
              className="w-full sm:w-1/2 rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]/60 transition"
            />
          </div>
        )}
      </div>
    </form>
  );
}
