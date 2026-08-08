import { STEPS } from "./examBuilderConstants";

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                active
                  ? "bg-[var(--primary)]/20 text-[var(--primary)] ring-2 ring-[var(--primary)]/30"
                  : done
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-muted/20 text-muted-foreground"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  active ? "bg-[var(--primary)] text-white" : done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              {label}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-6 ${done ? "bg-emerald-500/40" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
