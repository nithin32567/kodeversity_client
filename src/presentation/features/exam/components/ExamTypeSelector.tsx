/**
 * ExamTypeSelector.tsx
 * Custom card-based exam type selector (MCQ active, Live Coding coming soon).
 */
import { FileQuestion, Code2, FileText } from "lucide-react";

export type ExamType = "MCQ" | "LIVE_CODING" | "QUIZZ";

interface ExamTypeSelectorProps {
  value: ExamType;
  onChange: (type: ExamType) => void;
}

const types: Array<{
  id: ExamType;
  icon: React.ReactNode;
  label: string;
  description: string;
  disabled?: boolean;
}> = [
  {
    id: "MCQ",
    icon: <FileQuestion className="h-6 w-6" />,
    label: "Multiple Choice",
    description: "Auto-graded, timed MCQ exam",
  },
  {
    id: "QUIZZ",
    icon: <FileText className="h-6 w-6" />,
    label: "Quiz",
    description: "Questions requiring exact text answers",
  },
  {
    id: "LIVE_CODING",
    icon: <Code2 className="h-6 w-6" />,
    label: "Live Coding",
    description: "Real-time coding challenge",
    disabled: true,
  },
];

export function ExamTypeSelector({ value, onChange }: ExamTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {types.map((t) => {
        const isSelected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            id={`exam-type-${t.id.toLowerCase()}`}
            disabled={t.disabled}
            onClick={() => !t.disabled && onChange(t.id)}
            aria-pressed={isSelected}
            aria-label={`${t.label}${t.disabled ? " (Coming Soon)" : ""}`}
            className={`relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-150
              ${t.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              ${
                isSelected && !t.disabled
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]/40 shadow-[0_0_20px_-4px_var(--primary)]"
                  : "border-border bg-card hover:border-[var(--primary)]/40"
              }
            `}
          >
            {t.disabled && (
              <span className="absolute top-2 right-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-300 uppercase tracking-wider">
                Coming Soon
              </span>
            )}
            <div
              className={`h-10 w-10 rounded-lg grid place-items-center ${
                isSelected && !t.disabled
                  ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                  : "bg-muted/30 text-muted-foreground"
              }`}
            >
              {t.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
