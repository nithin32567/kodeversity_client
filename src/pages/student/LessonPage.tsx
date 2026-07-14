import { Link } from "react-router-dom";
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
  BarChart3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Award,
  CheckCheck,
  Play,
  TerminalSquare
} from "lucide-react";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { PlaygroundWorkspace } from "@/presentation/features/playground";
import { ModuleCompletionBanner } from "@/presentation/features/student-learning/components/ModuleCompletionBanner";

import { useLessonPage } from "./lesson-page/useLessonPage";
import { ActionTile, ProgressTile, Stat } from "./lesson-page/components/LessonTiles";
import { PlaygroundLaunchGate } from "./lesson-page/components/PlaygroundLaunchGate";
import { tabs } from "./lesson-page/mockData";
import { formatDuration } from "./lesson-page/utils";

export function LessonPage() {
  const {
    slug,
    isCourseLoading,
    isContentLoading,
    courseId,
    activeTab,
    setActiveTab,
    open,
    setOpen,
    resolvedModules,
    courseTitle,
    allChapters,
    selectedChapterId,
    setSelectedChapterId,
    activeChapter,
    isVideoLoading,
    activeVideoUrl,
    ytContainerRef,
    playgroundLaunched,
    setPlaygroundLaunched,
    completedChapters,
    completedModuleId,
    setCompletedModuleId,
    markChapterComplete,
    handleNextLesson,
    totalChapters,
    completedCount,
    progressPercentage,
    totalDurationStr,
  } = useLessonPage();

  const glow = useAccentRgb();

  if (isCourseLoading || (courseId && isContentLoading)) {
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
          <div className="flex flex-col gap-6">
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
                          <div ref={ytContainerRef} className="w-full h-full" />
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
                )}
              </>
            ) : (
              <div className="flex items-center justify-center min-h-[400px] bg-card border border-border rounded-2xl">
                <p className="text-muted-foreground">No lessons found in this course.</p>
              </div>
            )}

            {/* Module Completion Banner */}
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
                    chapters?: ((typeof allChapters)[0] & {
                      isLocked?: boolean;
                      progress?: number;
                    })[];
                  }[]
                ).map((m, i) => {
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
