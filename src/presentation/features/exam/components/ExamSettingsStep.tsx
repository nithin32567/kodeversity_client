import { UseFormReturn, Controller } from "react-hook-form";
import { type SetupForm } from "./examBuilderConstants";
import { DateTimePicker } from "./DateTimePicker";

interface ExamSettingsStepProps {
  form: UseFormReturn<SetupForm>;
  calculatedTotal: number;
  totalQuestions: number;
}

export function ExamSettingsStep({ form, calculatedTotal, totalQuestions }: ExamSettingsStepProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const watchStatus = watch("status");
  const watchPassMarks = watch("passMarks");
  const watchMinQuestions = watch("minQuestionsToAttend");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Passing Criteria */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-foreground">Passing Criteria & Duration</h3>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="duration-input" className="text-xs font-semibold text-foreground">
              Total Duration (Min) <span className="text-rose-400">*</span>
            </label>
            <input
              id="duration-input"
              type="number"
              min={1}
              aria-label="Total exam duration in minutes"
              {...register("durationMin", { valueAsNumber: true })}
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]/60 transition"
            />
            {errors.durationMin && (
              <p className="text-xs text-rose-400">{errors.durationMin.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pass-marks-input" className="text-xs font-semibold text-foreground">
              Pass Marks <span className="text-rose-400">*</span>
            </label>
            <input
              id="pass-marks-input"
              type="number"
              min={1}
              max={calculatedTotal}
              aria-label="Pass marks"
              {...register("passMarks", { valueAsNumber: true })}
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]/60 transition"
            />
            {errors.passMarks && (
              <p className="text-xs text-rose-400">{errors.passMarks.message}</p>
            )}
            {watchPassMarks > calculatedTotal && (
              <p className="text-xs text-rose-400">Cannot exceed total marks ({calculatedTotal})</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="min-questions-input" className="text-xs font-semibold text-foreground">
              Min. Questions to Attend
            </label>
            <input
              id="min-questions-input"
              type="number"
              min={0}
              max={totalQuestions}
              aria-label="Min questions to attend"
              {...register("minQuestionsToAttend", { valueAsNumber: true })}
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]/60 transition"
            />
            {watchMinQuestions !== undefined && watchMinQuestions > totalQuestions && (
              <p className="text-xs text-rose-400">Cannot exceed total questions ({totalQuestions})</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="max-attempts-input" className="text-xs font-semibold text-foreground">
              Max Attempts <span className="text-rose-400">*</span>
            </label>
            <input
              id="max-attempts-input"
              type="number"
              min={1}
              aria-label="Max attempts"
              {...register("maxAttempts", { valueAsNumber: true })}
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]/60 transition"
            />
            {errors.maxAttempts && (
              <p className="text-xs text-rose-400">{errors.maxAttempts.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Scheduling */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Controller
          control={form.control}
          name="scheduledStartDate"
          render={({ field }) => (
            <DateTimePicker
              label="Scheduled Start Date (Optional)"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={form.control}
          name="scheduledEndDate"
          render={({ field }) => (
            <DateTimePicker
              label="Scheduled End Date (Optional)"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">Status</label>
        <div className="flex items-center gap-4">
          {(["DRAFT", "PUBLISHED"] as const).map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={s}
                {...register("status")}
                aria-label={`Set status to ${s.toLowerCase()}`}
                className="accent-[var(--primary)]"
              />
              <span
                className={`text-sm font-medium ${
                  watchStatus === s ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
