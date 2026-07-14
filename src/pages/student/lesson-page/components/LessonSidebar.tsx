import {
  Lock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  FileText,
  ListChecks,
  TerminalSquare,
  Award,
} from "lucide-react";
import { MagicBentoCard } from "@/presentation/global/MagicBento";
import { Stat } from "./LessonTiles";
import { formatDuration } from "../utils";
import { ChapterDisplay } from "../types";

interface LessonSidebarProps {
  glow: string;
  progressPercentage: number;
  completedCount: number;
  totalChapters: number;
  resolvedModules: unknown[];
  allChapters: ChapterDisplay[];
  completedChapters: Set<string>;
  activeChapter: ChapterDisplay | null;
  open: Record<number, boolean>;
  setOpen: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  setSelectedChapterId: (id: string | null) => void;
  totalDurationStr: string;
  /** Map of lessonId → { watchTime, percentage } for showing partial watch progress */
  localProgress: Map<string, { watchTime: number; percentage: number }>;
}

export function LessonSidebar({
  glow,
  progressPercentage,
  completedCount,
  totalChapters,
  resolvedModules,
  allChapters,
  completedChapters,
  activeChapter,
  open,
  setOpen,
  setSelectedChapterId,
  totalDurationStr,
  localProgress,
}: LessonSidebarProps) {
  return (
    <aside className="flex flex-col gap-4">
      <MagicBentoCard
        className="rounded-2xl border border-border bg-card px-4 py-3"
        glowColor={glow}
        enableStars={false}
        enableMagnetism={false}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Your Progress</span>
          <span className="text-xs font-semibold text-primary">{progressPercentage}%</span>
        </div>
        <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[image:var(--gradient-primary)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </MagicBentoCard>

      <MagicBentoCard
        className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-card p-5"
        glowColor={glow}
        enableStars={false}
        enableMagnetism={false}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Course Content</h3>
          <span className="text-xs text-muted-foreground">
            {completedCount} / {totalChapters}
          </span>
        </div>

        <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-color:color-mix(in_srgb,var(--primary)_45%,transparent)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[color-mix(in_srgb,var(--primary)_45%,transparent)] [&::-webkit-scrollbar-thumb:hover]:bg-[color-mix(in_srgb,var(--primary)_70%,transparent)] [&::-webkit-scrollbar-track]:bg-transparent">
          {(
            resolvedModules as {
              id: string;
              title: string;
              isLocked?: boolean;
              chapters?: (ChapterDisplay & {
                isLocked?: boolean;
                progress?: number;
              })[];
            }[]
          ).map((m, i) => {
            const modChapters = (m.chapters ?? []) as (ChapterDisplay & {
              isLocked?: boolean;
              progress?: number;
            })[];
            const modCompleted = modChapters.filter((c) =>
              completedChapters.has(c.id),
            ).length;
            const modTotal = modChapters.length;
            const modProgressPct =
              modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;
            const isModuleLocked = !!m.isLocked;

            return (
              <div
                key={m.id ?? m.title}
                className={`rounded-lg border bg-background/30 transition-all ${isModuleLocked ? "border-border/50 opacity-60" : "border-border"}`}
              >
                <button
                  onClick={() => !isModuleLocked && setOpen((s) => ({ ...s, [i]: !s[i] }))}
                  disabled={isModuleLocked}
                  aria-disabled={isModuleLocked}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left ${
                    isModuleLocked ? "cursor-not-allowed" : ""
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                    {isModuleLocked ? (
                      <Lock className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                    ) : open[i] ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">{m.title}</span>
                  </span>
                  {!isModuleLocked && (
                    <span className="ml-2 shrink-0 text-[10px] text-muted-foreground tabular-nums">
                      {modCompleted}/{modTotal}
                    </span>
                  )}
                </button>

                {!isModuleLocked && modTotal > 0 && (
                  <div className="mx-3 mb-1 h-0.5 w-[calc(100%-1.5rem)] overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-all duration-500"
                      style={{ width: `${modProgressPct}%` }}
                    />
                  </div>
                )}

                {open[i] && !isModuleLocked && modChapters.length > 0 && (
                  <ul className="border-t border-border px-2 py-2 space-y-1">
                    {modChapters.map((ch, idx) => {
                      const isCurrent = activeChapter?.id === ch.id;
                      const isCompleted =
                        completedChapters.has(ch.id) ||
                        (ch.progress != null && ch.progress >= 90);
                      const isChapterLocked = !!ch.isLocked;

                      return (
                        <li key={ch.id}>
                          <button
                            onClick={() => !isChapterLocked && setSelectedChapterId(ch.id)}
                            disabled={isChapterLocked}
                            aria-disabled={isChapterLocked}
                            title={isChapterLocked ? "This lesson is locked" : undefined}
                            className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-xs transition text-left ${
                              isChapterLocked
                                ? "opacity-50 cursor-not-allowed text-muted-foreground"
                                : isCurrent
                                  ? "border border-primary/40 bg-primary-soft text-primary font-medium"
                                  : "hover:bg-foreground/[0.04] text-foreground/80"
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              {isChapterLocked ? (
                                <Lock className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                              ) : isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                              ) : isCurrent ? (
                                <PlayCircle className="h-4 w-4 shrink-0 text-primary animate-pulse" />
                              ) : ch.type === "PLAYGROUND" ? (
                                <TerminalSquare className="h-4 w-4 shrink-0 text-purple-400" />
                              ) : ch.type === "DOCUMENT" ? (
                                <FileText className="h-4 w-4 shrink-0 text-amber-400" />
                              ) : ch.type === "QUIZ" ? (
                                <ListChecks className="h-4 w-4 shrink-0 text-emerald-400" />
                              ) : (
                                <PlayCircle className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                              )}
                              <span className="truncate">
                                {idx + 1}. {ch.title}
                              </span>
                            </span>

                            {isCompleted ? (
                              <span className="ml-2 shrink-0 inline-flex h-4 w-4 place-items-center justify-center rounded-full bg-emerald-500/15">
                                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                              </span>
                            ) : isChapterLocked ? (
                              <Lock className="ml-2 h-3 w-3 shrink-0 text-muted-foreground/40" />
                            ) : (() => {
                              const prog = localProgress.get(ch.id);
                              const pct = prog?.percentage ?? 0;
                              return pct > 2 ? (
                                <span className="ml-2 shrink-0 text-[10px] font-semibold text-primary tabular-nums">
                                  {Math.round(pct)}%
                                </span>
                              ) : (
                                <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">
                                  {formatDuration(ch.durationInSeconds || ch.duration)}
                                </span>
                              );
                            })()}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </MagicBentoCard>

      <MagicBentoCard
        className="rounded-2xl border border-border bg-card p-5"
        glowColor={glow}
        enableStars={false}
        enableMagnetism={false}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Overall Course Progress</h3>
          <span className="text-sm font-semibold text-primary">{progressPercentage}%</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-[image:var(--gradient-primary)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat value={totalChapters.toString()} label="Lessons" />
          <Stat value={totalDurationStr} label="Time" />
          <Stat
            value={progressPercentage >= 100 ? "Unlocked" : "Locked"}
            label="Certificate"
            icon={<Award className="h-3 w-3" />}
          />
        </div>
      </MagicBentoCard>
    </aside>
  );
}
