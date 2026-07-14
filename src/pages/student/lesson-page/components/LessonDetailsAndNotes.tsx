import { PlayCircle, BarChart3, FileText, Bold, Italic, List, ListOrdered } from "lucide-react";
import { MagicBentoCard } from "@/presentation/global/MagicBento";
import { formatDuration } from "../utils";
import { ChapterDisplay } from "../types";

interface LessonDetailsAndNotesProps {
  glow: string;
  activeChapter: ChapterDisplay | null;
  courseTitle: string;
}

export function LessonDetailsAndNotes({
  glow,
  activeChapter,
  courseTitle,
}: LessonDetailsAndNotesProps) {
  return (
    <div className="grid items-stretch gap-5 md:grid-cols-2">
      <MagicBentoCard
        className="flex h-full flex-col rounded-2xl border border-border bg-card p-5"
        glowColor={glow}
        enableStars={false}
        enableMagnetism={false}
      >
        <div data-context-menu="lesson-content" className="w-full h-full">
          {activeChapter ? (
            <div className="flex items-start gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-primary-soft">
                <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-[var(--accent-violet)]">
                  <div className="h-2 w-2 rounded-full bg-[var(--accent-violet)]" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    {activeChapter.title}
                  </h3>
                  <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">
                    Current Lesson
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{courseTitle}</p>
                <p className="mt-2 text-sm text-foreground/80">
                  Type: {activeChapter.type} lesson. Master real-world cloud/systems
                  capabilities through Kodeversity.
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <PlayCircle className="h-3.5 w-3.5" />{" "}
                    {formatDuration(
                      activeChapter.durationInSeconds || activeChapter.duration,
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5" />{" "}
                    {activeChapter.playgroundConfig?.difficulty || "Beginner"}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> English
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No active lesson selected.</p>
          )}
        </div>
      </MagicBentoCard>

      <MagicBentoCard
        className="flex h-full flex-col rounded-2xl border border-border bg-card p-5"
        glowColor={glow}
        enableStars={false}
        enableMagnetism={false}
      >
        <h3 className="text-sm font-semibold">Take Notes</h3>
        <textarea
          placeholder="Write your notes for this lesson..."
          className="mt-3 h-24 w-full flex-1 resize-none rounded-lg border border-border bg-background/40 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-muted-foreground">
            <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
              <List className="h-3.5 w-3.5" />
            </button>
            <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
          </div>
          <button className="rounded-lg bg-[image:var(--gradient-primary)] px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-primary)] transition-transform hover:scale-[1.02]">
            Save Note
          </button>
        </div>
      </MagicBentoCard>
    </div>
  );
}
