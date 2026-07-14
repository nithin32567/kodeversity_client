import { FileText, ListChecks, TerminalSquare, ChevronRight, Play } from "lucide-react";
import { PlaygroundWorkspace } from "@/presentation/features/playground";
import { PlaygroundLaunchGate } from "./PlaygroundLaunchGate";
import { MagicBentoCard } from "@/presentation/global/MagicBento";
import {
  SecurityAlertOverlay,
  ChapterCompletedOverlay,
  VideoProgressBar,
  InteractionShield,
} from "@/components/course-preview/PlayerComponents";
import { ChapterDisplay } from "../types";

interface LessonContentPlayerProps {
  activeChapter: ChapterDisplay | null;
  courseId?: string;
  playgroundLaunched: boolean;
  setPlaygroundLaunched: (val: boolean) => void;
  markChapterComplete: (id: string) => void;
  allChapters: ChapterDisplay[];
  handleNextLesson: () => void;
  glow: string;
  isFullscreen: boolean;
  playerContainerRef: React.RefObject<HTMLDivElement | null>;
  isVideoLoading: boolean;
  activeVideoUrl: string | null;
  isExtensionDetected: boolean;
  resetExtensionGuard: () => void;
  ytContainerRef: React.RefObject<HTMLDivElement | null>;
  videoEnded: boolean;
  togglePlay: () => void;
  handleRewatch: () => void;
  hasSavedProgress: boolean;
  handleResume: () => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  handleSeek: (val: number) => void;
  toggleFullscreen: () => void;
}

export function LessonContentPlayer({
  activeChapter,
  courseId,
  playgroundLaunched,
  setPlaygroundLaunched,
  markChapterComplete,
  allChapters,
  handleNextLesson,
  glow,
  isFullscreen,
  playerContainerRef,
  isVideoLoading,
  activeVideoUrl,
  isExtensionDetected,
  resetExtensionGuard,
  ytContainerRef,
  videoEnded,
  togglePlay,
  handleRewatch,
  hasSavedProgress,
  handleResume,
  isPlaying,
  currentTime,
  duration,
  handleSeek,
  toggleFullscreen,
}: LessonContentPlayerProps) {
  if (!activeChapter) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-card border border-border rounded-2xl">
        <p className="text-muted-foreground">No lessons found in this course.</p>
      </div>
    );
  }

  if (activeChapter.type === "PLAYGROUND") {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden h-[75vh] flex flex-col min-h-[600px] shadow-lg">
        {!activeChapter.playgroundConfig ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
            <TerminalSquare className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground/70 mb-1">
              Playground not configured
            </p>
            <p className="text-xs max-w-xs">
              This lesson has no sandbox environment attached yet. Please contact your
              instructor.
            </p>
          </div>
        ) : playgroundLaunched ? (
          <PlaygroundWorkspace
            config={activeChapter.playgroundConfig}
            from="course"
            fromId={courseId || ""}
            onStop={() => setPlaygroundLaunched(false)}
            onMarkComplete={() => markChapterComplete(activeChapter.id)}
          />
        ) : (
          <PlaygroundLaunchGate
            chapter={activeChapter}
            onLaunch={() => setPlaygroundLaunched(true)}
          />
        )}
      </div>
    );
  }

  if (activeChapter.type === "DOCUMENT") {
    return (
      <div
        className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col p-6 space-y-4 min-h-[450px]"
        data-context-type="text"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500/10">
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {activeChapter.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                Document Reading Assignment
              </p>
            </div>
          </div>
          {activeChapter.documentUrl && (
            <a
              href={activeChapter.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition"
            >
              Open in Tab
            </a>
          )}
        </div>
        <div
          data-context-menu="lesson-content"
          className="flex-1 overflow-y-auto max-h-[500px] text-sm text-foreground/85 leading-relaxed space-y-4 pr-2"
        >
          <p className="font-semibold text-foreground">Lesson Reference Information:</p>
          <p>
            This lesson contains documentation and instructions designed to help you
            build practical mastery. Please read the document carefully and practice the
            setup/steps described inside.
          </p>
          <div className="rounded-xl bg-background/50 border border-border p-4 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Included Document Link:
            </p>
            <p className="text-xs text-primary hover:underline break-all">
              {activeChapter.documentUrl || "No URL provided"}
            </p>
          </div>
        </div>
        <div className="pt-4 border-t border-border flex justify-end">
          <button
            onClick={() => markChapterComplete(activeChapter.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[image:var(--gradient-primary)] px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-primary)] hover:scale-[1.02] transition"
          >
            Mark as Completed
          </button>
        </div>
      </div>
    );
  }

  if (activeChapter.type === "QUIZ") {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col p-6 space-y-4 min-h-[450px] justify-center items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 mb-3">
          <ListChecks className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Lesson Practice Quiz</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Test your understanding of the concepts covered in "{activeChapter.title}" to
          unlock rewards and check your progress.
        </p>
        <button
          onClick={() => markChapterComplete(activeChapter.id)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[image:var(--gradient-primary)] px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-primary)] hover:scale-[1.02] transition"
        >
          Start Practice Quiz
        </button>
      </div>
    );
  }

  // Default is VIDEO player
  return (
    <div
      ref={playerContainerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-[9999] bg-[#07060f] w-screen h-screen flex flex-col p-4 md:p-8 justify-center gap-4"
          : "flex flex-col gap-4"
      }
    >
      <MagicBentoCard
        className={`overflow-hidden rounded-2xl border border-border bg-card ${isFullscreen ? "flex-1 min-h-0" : ""}`}
        glowColor={glow}
        enableStars={false}
        enableMagnetism={false}
      >
        <div
          className="relative aspect-[16/9] w-full h-full overflow-hidden bg-[#07060f] flex items-center justify-center"
          data-context-type="video"
        >
          {isVideoLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Loading video...
              </p>
            </div>
          ) : activeVideoUrl ? (
            activeVideoUrl.includes("youtube.com") ||
            activeVideoUrl.includes("youtu.be") ? (
              isExtensionDetected ? (
                <SecurityAlertOverlay onRetry={resetExtensionGuard} />
              ) : (
                <div className="relative w-full h-full">
                  <div ref={ytContainerRef} className="w-full h-full" />
                  {!videoEnded && (
                    <InteractionShield
                      containerRef={playerContainerRef}
                      onTogglePlay={togglePlay}
                    />
                  )}
                  {videoEnded && (
                    <ChapterCompletedOverlay
                      hasNext={
                        allChapters.findIndex((c) => c.id === activeChapter.id) <
                        allChapters.length - 1
                      }
                      onRewatch={handleRewatch}
                      onNext={handleNextLesson}
                    />
                  )}
                </div>
              )
            ) : (
              <video
                src={activeVideoUrl}
                controls
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <div
              className="relative grid aspect-[16/8] w-full place-items-center"
              style={{
                background:
                  "radial-gradient(ellipse at center, color-mix(in oklab, var(--accent-violet) 35%, #0b0a1f) 0%, #06050f 70%)",
              }}
            >
              <button
                onClick={handleNextLesson}
                className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur hover:bg-background/80"
              >
                Next Lesson <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <div className="absolute left-8 top-1/2 max-w-sm -translate-y-1/2">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Video Lesson
                </p>
                <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
                  {activeChapter.title}
                </h1>
                <p className="mt-2 text-xs text-foreground/70">
                  Press play to start watching.
                </p>
              </div>

              <div className="relative grid h-36 w-36 place-items-center">
                <div className="absolute inset-0 animate-pulse">
                  {[0, 60, 120].map((rot) => (
                    <div
                      key={rot}
                      className="absolute inset-0 rounded-full border-2 border-[var(--accent-cyan)]/70"
                      style={{ transform: `rotate(${rot}deg) scaleY(0.4)` }}
                    />
                  ))}
                </div>
                <div className="relative grid h-3 w-3 place-items-center rounded-full bg-[var(--accent-cyan)]" />
                <button
                  aria-label="Play"
                  className="absolute grid h-14 w-14 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur transition hover:scale-110"
                >
                  <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                </button>
              </div>
            </div>
          )}
        </div>
      </MagicBentoCard>

      {activeVideoUrl &&
        (activeVideoUrl.includes("youtube.com") ||
          activeVideoUrl.includes("youtu.be")) &&
        !videoEnded && (
          <>
            {/* Resume pill — shown above the progress bar when there's a saved position */}
            {hasSavedProgress && (
              <div className="flex justify-end px-1 -mb-1">
                <button
                  id="resume-video-btn"
                  onClick={handleResume}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary backdrop-blur hover:bg-primary/20 transition-all hover:scale-105 shadow-sm"
                >
                  ▶ Resume where you left off
                </button>
              </div>
            )}
            <VideoProgressBar
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              isFullscreen={isFullscreen}
              onTogglePlay={togglePlay}
              onSeek={handleSeek}
              onToggleFullscreen={toggleFullscreen}
            />
          </>
        )}
    </div>
  );
}
