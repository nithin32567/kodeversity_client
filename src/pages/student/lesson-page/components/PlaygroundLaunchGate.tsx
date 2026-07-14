import { TerminalSquare, BarChart3, Award, PlayCircle, ChevronRight } from "lucide-react";
import { ChapterDisplay } from "../types";
import { DIFFICULTY_META } from "../mockData";

export function PlaygroundLaunchGate({
  chapter,
  onLaunch,
}: {
  chapter: ChapterDisplay;
  onLaunch: () => void;
}) {
  const diff = chapter.playgroundConfig?.difficulty ?? "easy";
  const meta = DIFFICULTY_META[diff] ?? DIFFICULTY_META.easy;
  const maxScore = chapter.playgroundConfig?.maxScore ?? 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#07060f] relative overflow-hidden">
      {}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[var(--accent-cyan)]/10 blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 h-[200px] w-[200px] rounded-full bg-[var(--accent-violet)]/10 blur-[80px]" />
      </div>

      {}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">
        {}
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-2xl bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 flex items-center justify-center shadow-[0_0_40px_-8px_var(--accent-cyan)]">
            <TerminalSquare className="h-9 w-9 text-[var(--accent-cyan)]" />
          </div>
          <div className="absolute -inset-1 rounded-2xl border border-[var(--accent-cyan)]/20 animate-ping" />
        </div>

        {}
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-cyan)]/80 mb-2">
          Interactive Lab
        </p>
        <h2 className="text-2xl font-bold text-foreground mb-2 font-mono uppercase tracking-tight">
          {chapter.title}
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          This lesson includes a live cloud sandbox environment. Click below to provision your
          isolated workspace — it will be ready in about 60 seconds.
        </p>

        {}
        <div className="flex items-center gap-3 mb-8 flex-wrap justify-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${meta.bg} ${meta.color}`}
          >
            <BarChart3 className="h-3 w-3" />
            {meta.label}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground">
            <Award className="h-3 w-3 text-amber-400" />
            Up to {maxScore} pts
          </span>
          {chapter.duration && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground">
              <PlayCircle className="h-3 w-3 text-sky-400" />~{Math.ceil(chapter.duration / 60)} min
            </span>
          )}
        </div>

        {}
        <button
          id="launch-playground-btn"
          onClick={onLaunch}
          className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-background font-bold text-[11px] uppercase tracking-[0.2em] shadow-[0_0_20px_var(--accent-cyan)] hover:scale-[1.03] active:scale-[0.98] transition-all"
        >
          <TerminalSquare className="h-4 w-4" />
          Launch Lab Environment
          <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <p className="mt-4 text-[11px] text-muted-foreground/60">
          Your environment will be automatically destroyed when you leave this lesson.
        </p>
      </div>
    </div>
  );
}
