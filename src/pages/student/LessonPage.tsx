import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Bell,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Maximize,
  Settings,
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
  Bold,
  Italic,
  List,
  ListOrdered,
  Award,
  CheckCheck,
} from "lucide-react";
import { findCourseBySlug } from "@/presentation/features/student-learning/components/data";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { useCourse } from "@/presentation/features/student-learning/hooks/useCourses";
import { PlaygroundWorkspace } from "@/presentation/features/playground";
import type { Chapter, ChapterType } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";
import { TerminalSquare } from "lucide-react";
import { ModuleCompletionBanner } from "@/presentation/features/student-learning/components/ModuleCompletionBanner";

type LessonStatus = "done" | "current" | "locked";

export interface ChapterDisplay {
  id: string;
  title: string;
  duration?: number;
  durationInSeconds?: number | null;
  status?: string;
  type?: string;
  videoUrl?: string;
  documentUrl?: string;
  playgroundConfig?: PlaygroundConfig;
}

const mockModules = [
  {
    id: "mod-1",
    title: "Module 1: Introduction",
    open: true,
    done: 3,
    total: 5,
    chapters: [
      {
        id: "chap-1",
        title: "Welcome to the course",
        duration: 312,
        status: "done" as LessonStatus,
        type: "VIDEO" as ChapterType,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        id: "chap-2",
        title: "Setup tools and environment",
        duration: 465,
        status: "done" as LessonStatus,
        type: "DOCUMENT" as ChapterType,
        documentUrl:
          "https://raw.githubusercontent.com/mdn/beginner-html-site-scripted/master/index.html",
      },
      {
        id: "chap-3",
        title: "React basics",
        duration: 1110,
        status: "current" as LessonStatus,
        type: "VIDEO" as ChapterType,
        videoUrl: "https://www.w3schools.com/html/movie.mp4",
      },
      {
        id: "chap-4",
        title: "Interactive Lab Playground",
        duration: 1500,
        status: "locked" as LessonStatus,
        type: "PLAYGROUND" as ChapterType,
        playgroundConfig: {
          pg: "6659f131a9de4f16462740bc",
          pgname: "1VMPG",
          playground: "ubuntu2404n1",
          difficulty: "easy" as const,
          maxScore: 100,
        },
      },
      {
        id: "chap-5",
        title: "Components and Props",
        duration: 940,
        status: "locked" as LessonStatus,
        type: "VIDEO" as ChapterType,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
    ],
  },
  {
    id: "mod-2",
    title: "Module 2: Components Deep Dive",
    open: true,
    done: 0,
    total: 3,
    chapters: [
      {
        id: "chap-6",
        title: "State and Lifecycle",
        duration: 990,
        status: "locked" as LessonStatus,
        type: "VIDEO" as ChapterType,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        id: "chap-7",
        title: "Docker Engine Lab",
        duration: 1800,
        status: "locked" as LessonStatus,
        type: "PLAYGROUND" as ChapterType,
        playgroundConfig: {
          pg: "665afc8a8b1a8d052a234f9a",
          pgname: "DOCKERPG",
          playground: "ubuntu2404n1-docker",
          difficulty: "medium" as const,
          maxScore: 150,
        },
      },
      {
        id: "chap-8",
        title: "Conditional Rendering",
        duration: 685,
        status: "locked" as LessonStatus,
        type: "VIDEO" as ChapterType,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
    ],
  },
];

const tabs = ["Overview", "Notes", "Resources", "Q&A", "Reviews (2.1K)"];

export function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: realCourse, isLoading: isCourseLoading } = useCourse(slug || "mock-course");
  const [activeTab, setActiveTab] = useState("Overview");
  const [open, setOpen] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: false,
    3: false,
    4: false,
  });
  const glow = useAccentRgb();

  const resolvedModules =
    realCourse?.modules && realCourse.modules.length > 0 ? realCourse.modules : mockModules;
  const courseTitle = realCourse?.title || "Course Player";
  const courseId = realCourse?.id || "mock-course-id";

  const allChapters = (resolvedModules as { chapters?: unknown[] }[]).flatMap(
    (m) => (m.chapters ?? []) as ChapterDisplay[],
  );

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const activeChapter =
    allChapters.find((c) => c.id === selectedChapterId) || allChapters[0] || null;

  const [playgroundLaunched, setPlaygroundLaunched] = useState(false);

  const prevChapterIdRef = useState<string | null>(null);
  if (prevChapterIdRef[0] !== (activeChapter?.id ?? null)) {
    prevChapterIdRef[1](activeChapter?.id ?? null);
    if (playgroundLaunched) setPlaygroundLaunched(false);
  }

  const [completedChapters, setCompletedChapters] = useState<Set<string>>(
    new Set(["chap-1", "chap-2"]),
  );

  // Tracks which module just had its final lesson completed → triggers banner
  const [completedModuleId, setCompletedModuleId] = useState<string | null>(null);

  const markChapterComplete = (id: string) => {
    setCompletedChapters((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    // Check if this chapter is the last in its module → show completion banner
    for (const mod of resolvedModules as { id: string; chapters?: { id: string }[] }[]) {
      const chapters = mod.chapters ?? [];
      if (chapters.length > 0 && chapters[chapters.length - 1].id === id) {
        setCompletedModuleId(mod.id);
        break;
      }
    }
  };

  const handleNextLesson = () => {
    if (!activeChapter) return;
    const currentIdx = allChapters.findIndex((c) => c.id === activeChapter.id);
    if (currentIdx !== -1 && currentIdx < allChapters.length - 1) {
      setSelectedChapterId(allChapters[currentIdx + 1].id);
    }
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isCourseLoading) {
    return (
      <main className="relative flex-1 w-full overflow-hidden bg-background flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
            Loading course player workspace...
          </p>
        </div>
      </main>
    );
  }

  const totalChapters = allChapters.length;
  const completedCount = allChapters.filter((c) => completedChapters.has(c.id)).length;
  const progressPercentage =
    totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
  const totalDurationSeconds = allChapters.reduce(
    (acc, ch) => acc + (ch.durationInSeconds || ch.duration || 0),
    0,
  );
  const totalDurationStr = `${Math.floor(totalDurationSeconds / 3600)}h ${Math.floor((totalDurationSeconds % 3600) / 60)}m`;

  return (
    <main className="relative flex-1 w-full overflow-hidden bg-background py-8 md:py-12">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 space-y-6 md:space-y-8">
        <Link
          to={`/student/courses/${slug!}`}
          className="group/btn inline-flex w-fit items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-muted-foreground hover:text-[var(--accent-cyan)] transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover/btn:-translate-x-1" />{" "}
          Back to Course
        </Link>

        <MagicBentoSection
          className="grid items-start gap-6 lg:grid-cols-[1fr_360px]"
          glowColor={glow}
          spotlightRadius={400}
        >
          {}
          <div className="flex flex-col gap-6">
            {}
            {activeChapter ? (
              <>
                {activeChapter.type === "PLAYGROUND" ? (
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
                        fromId={courseId}
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
                ) : activeChapter.type === "DOCUMENT" ? (
                  <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col p-6 space-y-4 min-h-[450px]">
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
                    <div className="flex-1 overflow-y-auto max-h-[500px] text-sm text-foreground/85 leading-relaxed space-y-4 pr-2">
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
                ) : activeChapter.type === "QUIZ" ? (
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
                ) : (
                  <MagicBentoCard
                    className="overflow-hidden rounded-2xl border border-border bg-card"
                    glowColor={glow}
                    enableStars={false}
                    enableMagnetism={false}
                  >
                    <div className="relative aspect-[16/9] w-full bg-[#07060f] flex items-center justify-center">
                      {activeChapter.videoUrl ? (
                        activeChapter.videoUrl.includes("youtube.com") ||
                        activeChapter.videoUrl.includes("youtu.be") ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${activeChapter.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)?.[1]}?autoplay=0&rel=0&controls=1`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                            title={activeChapter.title}
                          />
                        ) : (
                          <video
                            src={activeChapter.videoUrl}
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
                )}
              </>
            ) : (
              <div className="flex items-center justify-center min-h-[400px] bg-card border border-border rounded-2xl">
                <p className="text-muted-foreground">No lessons found in this course.</p>
              </div>
            )}

            {/* Module Completion Banner — fires when the final lesson of a module finishes */}
            {completedModuleId &&
              (() => {
                const modList = resolvedModules as { id: string; title: string }[];
                const modIndex = modList.findIndex((m) => m.id === completedModuleId);
                const completedMod = modList[modIndex];
                const nextMod = modList[modIndex + 1];
                return completedMod ? (
                  <ModuleCompletionBanner
                    courseSlug={slug ?? "mock-course"}
                    moduleId={completedMod.id}
                    moduleName={completedMod.title}
                    nextModuleName={nextMod?.title}
                    onApproved={() => setCompletedModuleId(null)}
                  />
                ) : null;
              })()}

            {}
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2 border-b border-border">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`relative -mb-px py-3 text-sm transition-colors ${
                    activeTab === t
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                  {activeTab === t && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>

            {}
            <div className="grid items-stretch gap-5 md:grid-cols-2">
              <MagicBentoCard
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-5"
                glowColor={glow}
                enableStars={false}
                enableMagnetism={false}
              >
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

            {}
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
                to={`/student/courses/${slug!}`}
              />
              <ActionTile
                icon={<ClipboardList className="h-4 w-4 text-sky-400" />}
                title="Assignment"
                desc="Apply what you learned in a hands-on assignment."
                cta="View Assignment"
              />
              <ProgressTile />
            </div>

            {}
            <MagicBentoCard
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              glowColor={glow}
              enableStars={false}
              enableMagnetism={false}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/15">
                  <CheckCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    Great job! Keep going 🚀
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Complete all lessons in this module to unlock the next one.
                  </div>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-4 py-2 text-xs font-medium text-foreground hover:bg-foreground/[0.04]">
                <BarChart3 className="h-3.5 w-3.5" /> View Progress
              </button>
            </MagicBentoCard>
          </div>

          {}
          <aside className="flex flex-col gap-4">
            {}
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
                    chapters?: ((typeof allChapters)[0] & {
                      isLocked?: boolean;
                      progress?: number;
                    })[];
                  }[]
                ).map((m, i) => {
                  // Per-module stats
                  const modChapters = (m.chapters ?? []) as ((typeof allChapters)[0] & {
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
                      {/* Module accordion header */}
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
                        {/* Per-module mini progress pill */}
                        {!isModuleLocked && (
                          <span className="ml-2 shrink-0 text-[10px] text-muted-foreground tabular-nums">
                            {modCompleted}/{modTotal}
                          </span>
                        )}
                      </button>

                      {/* Per-module progress bar */}
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
                            // A chapter is "completed" if it's in the set, OR if backend progress >= 90
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
                                    {/* Leading icon: locked > completed > current > type-based */}
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

                                  {/* Trailing: either progress bar or duration */}
                                  {isCompleted ? (
                                    <span className="ml-2 shrink-0 inline-flex h-4 w-4 place-items-center justify-center rounded-full bg-emerald-500/15">
                                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                                    </span>
                                  ) : isChapterLocked ? (
                                    <Lock className="ml-2 h-3 w-3 shrink-0 text-muted-foreground/40" />
                                  ) : (
                                    <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">
                                      {formatDuration(ch.durationInSeconds || ch.duration)}
                                    </span>
                                  )}
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
        </MagicBentoSection>
      </div>
    </main>
  );
}

function ActionTile({
  icon,
  title,
  desc,
  cta,
  to,
  params,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  to?: string;
  params?: Record<string, string>;
}) {
  const glow = useAccentRgb();
  const btnClass =
    "mt-4 flex items-center justify-center gap-2 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-cyan)] transition-colors hover:bg-[var(--accent-cyan)]/20 hover:text-white";
  return (
    <MagicBentoCard
      className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)]"
      glowColor={glow}
      enableStars={false}
      enableMagnetism={false}
    >
      <div className="flex items-center gap-2 text-sm font-bold font-mono uppercase tracking-wide">
        {icon} {title}
      </div>
      <p className="mt-2 flex-1 text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      {to ? (
        <Link to={to as string} className={btnClass}>
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

function ProgressTile() {
  const glow = useAccentRgb();
  return (
    <MagicBentoCard
      className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-[var(--accent-violet)] hover:shadow-[0_0_30px_-10px_var(--accent-violet)]"
      glowColor={glow}
      enableStars={false}
      enableMagnetism={false}
    >
      <div className="text-sm font-bold font-mono uppercase tracking-wide text-foreground">
        Lesson Progress
      </div>
      <div className="mt-2 flex flex-1 items-center gap-3">
        <div
          className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full"
          style={{
            background:
              "conic-gradient(var(--accent-violet) 0deg 270deg, color-mix(in oklab, var(--foreground) 10%, transparent) 270deg 360deg)",
          }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-card text-center border border-[var(--accent-violet)]/20 shadow-[0_0_15px_-5px_var(--accent-violet)]">
            <span className="text-[11px] font-bold leading-none text-[var(--accent-violet)] font-mono">
              75%
            </span>
            <span className="text-[7px] font-mono tracking-widest uppercase leading-tight text-muted-foreground mt-0.5">
              Completed
            </span>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />{" "}
            <span>3 Completed</span>
          </li>
          <li className="flex items-center gap-2">
            <PlayCircle className="h-3.5 w-3.5 shrink-0 text-[var(--accent-cyan)] animate-pulse" />{" "}
            <span>1 In Progress</span>
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" /> <span>1 Locked</span>
          </li>
        </ul>
      </div>
    </MagicBentoCard>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-2 text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-foreground font-mono uppercase">
        {icon}
        {value}
      </div>
      <div className="mt-1 text-[9px] font-mono tracking-widest uppercase text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

const DIFFICULTY_META = {
  easy: { label: "Easy", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  medium: {
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  hard: { label: "Hard", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  expert: {
    label: "Expert",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
};

function PlaygroundLaunchGate({
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
