import { Link, useParams } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { useGetChapterVideoQuery } from "@/features/course/courseApi";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  Lock,
  FileText,
  ListChecks,
  ClipboardList,
  Folder,
  BarChart3,
  Award,
  Play,
} from "lucide-react";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import { CustomContextMenu } from "@/components/ui/CustomContextMenu";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { useCourse } from "@/presentation/features/student-learning/hooks/useCourses";
import { PlaygroundWorkspace } from "@/presentation/features/playground";
import type { ChapterType } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";
import { TerminalSquare } from "lucide-react";
import { usePageProtection } from "@/hooks/usePageProtection";
import { useExtensionGuard } from "@/components/course-preview/ExtensionGuard";
import { useYouTubePlayer, formatDuration } from "@/components/course-preview/useYouTubePlayer";
import {
  SecurityAlertOverlay,
  ChapterCompletedOverlay,
  VideoProgressBar,
  VideoPlaceholder,
  LoadingSpinner,
  InteractionShield,
} from "@/components/course-preview/PlayerComponents";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ChapterDisplay {
  id: string;
  title: string;
  duration?: number;
  durationInSeconds?: number;
  status?: string;
  type?: string;
  videoUrl?: string;
  documentUrl?: string;
  playgroundConfig?: PlaygroundConfig;
}

const TABS = ["Overview", "Notes", "Resources", "Q&A", "Reviews (2.1K)"];

function formatCourseDuration(seconds: number): string {
  if (!seconds) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export function AdminPreviewCoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: realCourse, isLoading: isCourseLoading } = useCourse(slug || "");
  const { user } = useAuth();
  const isAdminOrInstructor = user?.role === "ADMIN" || user?.role === "INSTRUCTOR";
  const backLink =
    user?.role === "ADMIN" ? `/admin/courses/${slug || ""}` : `/instructor/courses/${slug || ""}`;
  const glow = useAccentRgb();

  const [activeTab, setActiveTab] = useState("Overview");
  const [open, setOpen] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: false,
    3: false,
    4: false,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());

  const playerContainerRef = useRef<HTMLDivElement>(null);

  usePageProtection();

  const { isExtensionDetected, reset: resetExtensionGuard } = useExtensionGuard(playerContainerRef);

  const resolvedModules = realCourse?.modules?.length ? realCourse.modules : [];
  const courseTitle = realCourse?.title || "Course Player";
  const courseId = realCourse?.id || "mock-course-id";
  const allChapters = (resolvedModules as { chapters?: unknown[] }[]).flatMap(
    (m) => m.chapters ?? [],
  ) as ChapterDisplay[];

  const activeChapter =
    allChapters.find((c) => c.id === selectedChapterId) || allChapters[0] || null;

  const { data: videoData, isFetching: isVideoLoading } = useGetChapterVideoQuery(
    activeChapter?.id || "",
    {
      skip: !activeChapter?.id || activeChapter.type !== "VIDEO",
    },
  );
  const activeVideoUrl = !isVideoLoading && videoData?.success ? videoData.videoUrl : null;

  const markChapterComplete = (id: string) =>
    setCompletedChapters((prev) => new Set([...prev, id]));

  const handleNextLesson = () => {
    if (!activeChapter) return;
    const idx = allChapters.findIndex((c) => c.id === activeChapter.id);
    if (idx !== -1 && idx < allChapters.length - 1) {
      setSelectedChapterId(allChapters[idx + 1].id);
      ytHooks.resetVideoEnded();
    }
  };

  const ytHooks = useYouTubePlayer(activeVideoUrl, activeChapter?.id ?? null, markChapterComplete);
  const {
    ytContainerRef,
    ytPlayerRef,
    isPlaying,
    videoEnded,
    currentTime,
    duration,
    resetVideoEnded,
  } = ytHooks;

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await playerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePlay = () => {
    const p = ytPlayerRef.current;
    if (!p) return;
    if (isPlaying) {
      p.pauseVideo();
    } else {
      p.playVideo();
    }
  };

  const handleSeek = (val: number) => {
    ytPlayerRef.current?.seekTo(val, true);
  };

  const handleRewatch = () => {
    resetVideoEnded();
    const p = ytPlayerRef.current;
    if (p) {
      p.seekTo(0, true);
      p.playVideo();
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalChapters = allChapters.length;
  const completedCount = allChapters.filter((c) => completedChapters.has(c.id)).length;
  const progressPercentage =
    totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
  const totalDurationSeconds = allChapters.reduce(
    (acc, ch) => acc + (ch.durationInSeconds || ch.duration || 0),
    0,
  );
  const totalDurationStr = formatCourseDuration(totalDurationSeconds);

  const isYouTubeUrl = (url: string) => url.includes("youtube.com") || url.includes("youtu.be");
  const hasNext = activeChapter
    ? allChapters.findIndex((c) => c.id === activeChapter.id) < allChapters.length - 1
    : false;

  if (isCourseLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <LoadingSpinner label="Loading course player workspace..." />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <CustomContextMenu isAdmin={isAdminOrInstructor} />
      <div className="mx-auto max-w-[1600px] px-6 py-6">
        <Link
          to={backLink}
          className="mb-4 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <MagicBentoSection
          className="grid items-start gap-6 lg:grid-cols-[1fr_360px]"
          glowColor={glow}
          spotlightRadius={400}
        >
          {/* ── Main Content ── */}
          <div className="flex flex-col gap-6">
            {/* Player / Content Pane */}
            {activeChapter ? (
              <>
                {activeChapter.type === "PLAYGROUND" ? (
                  <div className="rounded-2xl border border-border bg-card overflow-hidden h-[75vh] flex flex-col min-h-[600px] shadow-lg">
                    {activeChapter.playgroundConfig ? (
                      <PlaygroundWorkspace
                        config={activeChapter.playgroundConfig}
                        from="course"
                        fromId={courseId}
                        onStop={() => {}}
                        onMarkComplete={() => markChapterComplete(activeChapter.id)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                        <TerminalSquare className="h-12 w-12 text-muted-foreground/40 mb-3" />
                        <p className="text-sm">
                          No playground configuration found for this lesson.
                        </p>
                      </div>
                    )}
                  </div>
                ) : activeChapter.type === "DOCUMENT" ? (
                  <DocumentPane chapter={activeChapter} />
                ) : activeChapter.type === "QUIZ" ? (
                  <QuizPane title={activeChapter.title} />
                ) : (
                  // VIDEO / default
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
                          <LoadingSpinner label="Loading video..." />
                        ) : activeVideoUrl ? (
                          isYouTubeUrl(activeVideoUrl) ? (
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
                                    hasNext={hasNext}
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
                          <VideoPlaceholder title={activeChapter.title} onNext={handleNextLesson} />
                        )}
                      </div>
                    </MagicBentoCard>

                    {activeVideoUrl && isYouTubeUrl(activeVideoUrl) && !videoEnded && (
                      <VideoProgressBar
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        duration={duration}
                        isFullscreen={isFullscreen}
                        onTogglePlay={togglePlay}
                        onSeek={handleSeek}
                        onToggleFullscreen={toggleFullscreen}
                      />
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center min-h-[400px] bg-card border border-border rounded-2xl">
                <p className="text-muted-foreground">No lessons found in this course.</p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2 border-b border-border">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`relative -mb-px py-3 text-sm transition-colors ${activeTab === t ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                  {activeTab === t && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>

            {/* Overview Card */}
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
                          {formatDuration(activeChapter.duration)}
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

            {/* Action Tiles */}
            <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ActionTile
                icon={<FileText className="h-4 w-4 text-emerald-400" />}
                title="Resources"
                desc="Downloadable materials and useful links for this lesson."
                cta="View Resources"
              />
              <ActionTile
                icon={<ListChecks className="h-4 w-4 text-amber-400" />}
                title="Practice Quiz"
                desc="Test your understanding with a quick quiz."
                cta="Start Quiz"
                to={`/student/playground/${slug || ""}`}
              />
              <ActionTile
                icon={<ClipboardList className="h-4 w-4 text-sky-400" />}
                title="Assignment"
                desc="Apply what you learned in a hands-on assignment."
                cta="View Assignment"
              />
              <ProgressTile
                progressPercentage={progressPercentage}
                completedCount={completedCount}
                totalChapters={totalChapters}
              />
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="flex flex-col gap-4">
            <MagicBentoCard
              className="rounded-2xl border border-primary/40 bg-primary-soft px-4 py-3"
              glowColor={glow}
              enableStars={false}
              enableMagnetism={false}
            >
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Admin Preview Mode
              </span>
              <p className="text-xs text-primary/80 mt-1">
                Viewing content as it appears to enrolled students.
              </p>
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
              <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-color:color-mix(in_srgb,var(--primary)_45%,transparent)_transparent] [scrollbar-width:thin]">
                {resolvedModules.map((m, i) => (
                  <div key={m.title} className="rounded-lg border border-border bg-background/30">
                    <button
                      onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {open[i] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        {m.title}
                      </span>
                    </button>
                    {open[i] && m.chapters?.length > 0 && (
                      <ul className="border-t border-border px-2 py-2 space-y-1">
                        {m.chapters.map((ch, idx) => {
                          const isCurrent = activeChapter?.id === ch.id;
                          const isCompleted = completedChapters.has(ch.id);
                          return (
                            <li key={ch.id}>
                              <button
                                onClick={() => setSelectedChapterId(ch.id)}
                                className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-xs transition text-left ${isCurrent ? "border border-primary/40 bg-primary-soft text-primary font-medium" : "hover:bg-foreground/[0.04] text-foreground/80"}`}
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  {isCompleted ? (
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
                                <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">
                                  {formatDuration(ch.duration)}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </MagicBentoCard>

            <MagicBentoCard
              className="rounded-2xl border border-border bg-card p-5"
              glowColor={glow}
              enableStars={false}
              enableMagnetism={false}
            >
              <h3 className="text-sm font-semibold">Course Statistics</h3>
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
        </MagicBentoSection>
      </div>
    </main>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DocumentPane({ chapter }: { chapter: ChapterDisplay }) {
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
            <h2 className="text-lg font-semibold text-foreground">{chapter.title}</h2>
            <p className="text-xs text-muted-foreground">Document Reading Assignment</p>
          </div>
        </div>
        {chapter.documentUrl && (
          <a
            href={chapter.documentUrl}
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
          This lesson contains documentation and instructions designed to help you build practical
          mastery. Please read the document carefully and practice the setup/steps described inside.
        </p>
        <div className="rounded-xl bg-background/50 border border-border p-4 space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Included Document Link:
          </p>
          <p className="text-xs text-primary hover:underline break-all">
            {chapter.documentUrl || "No URL provided"}
          </p>
        </div>
      </div>
      <div className="pt-4 border-t border-border flex justify-end">
        <span className="text-xs text-muted-foreground italic">Document view - Admin Preview</span>
      </div>
    </div>
  );
}

function QuizPane({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col p-6 space-y-4 min-h-[450px] justify-center items-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 mb-3">
        <ListChecks className="h-8 w-8 text-emerald-500" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Lesson Practice Quiz</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Test your understanding of the concepts covered in "{title}" to unlock rewards and check
        your progress.
      </p>
      <button className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[image:var(--gradient-primary)] px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-primary)] hover:scale-[1.02] transition">
        Preview Quiz (Admin)
      </button>
    </div>
  );
}

function ActionTile({
  icon,
  title,
  desc,
  cta,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  to?: string;
}) {
  const glow = useAccentRgb();
  const btnClass =
    "mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-soft px-3 py-2 text-xs font-medium text-primary hover:bg-primary/15";
  return (
    <MagicBentoCard
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-4"
      glowColor={glow}
      enableStars={false}
      enableMagnetism={false}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        {icon} {title}
      </div>
      <p className="mt-2 flex-1 text-xs text-muted-foreground">{desc}</p>
      {to ? (
        <Link to={to} className={btnClass}>
          <Folder className="h-3.5 w-3.5" /> {cta}
        </Link>
      ) : (
        <button className={btnClass}>
          <Folder className="h-3.5 w-3.5" /> {cta}
        </button>
      )}
    </MagicBentoCard>
  );
}

function ProgressTile({
  progressPercentage,
  completedCount,
  totalChapters,
}: {
  progressPercentage: number;
  completedCount: number;
  totalChapters: number;
}) {
  const glow = useAccentRgb();
  const lockedCount = Math.max(0, totalChapters - completedCount);
  return (
    <MagicBentoCard
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-4"
      glowColor={glow}
      enableStars={false}
      enableMagnetism={false}
    >
      <div className="text-sm font-semibold">Lesson Progress</div>
      <div className="mt-2 flex flex-1 items-center gap-3">
        <div
          className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(rgb(16 185 129) 0deg ${progressPercentage * 3.6}deg, color-mix(in oklab, var(--foreground) 10%, transparent) ${progressPercentage * 3.6}deg 360deg)`,
          }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-card text-center">
            <span className="text-[11px] font-bold leading-none text-emerald-400">
              {progressPercentage}%
            </span>
            <span className="text-[9px] leading-tight text-muted-foreground">Completed</span>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-xs">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" /> {completedCount}{" "}
            Completed
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> {lockedCount} Locked
          </li>
        </ul>
      </div>
    </MagicBentoCard>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/30 px-2 py-2">
      <div className="flex items-center justify-center gap-1 text-xs font-semibold text-foreground">
        {icon}
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
