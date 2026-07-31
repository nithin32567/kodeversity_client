import { Link } from "react-router-dom";
import { ArrowLeft, FileText, ListChecks, ClipboardList, BarChart3, CheckCheck } from "lucide-react";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import { ModuleCompletionBanner } from "@/presentation/features/student-learning/components/ModuleCompletionBanner";
import { CustomContextMenu } from "@/components/ui/CustomContextMenu";

import { useLessonPage } from "./lesson-page/useLessonPage";
import { ActionTile, ProgressTile } from "./lesson-page/components/LessonTiles";
import { LessonContentPlayer } from "./lesson-page/components/LessonContentPlayer";
import { LessonDetailsAndNotes } from "./lesson-page/components/LessonDetailsAndNotes";
import { LessonSidebar } from "./lesson-page/components/LessonSidebar";
import { tabs } from "./lesson-page/mockData";

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
    setSelectedChapterId,
    activeChapter,
    isVideoLoading,
    activeVideoUrl,
    isPlaying,
    videoEnded,
    currentTime,
    duration,
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
    glow,
    isFullscreen,
    playerContainerRef,
    isExtensionDetected,
    resetExtensionGuard,
    toggleFullscreen,
    togglePlay,
    handleSeek,
    handleRewatch,
    hasSavedProgress,
    handleResume,
    localProgress,
    initialLessonSelected,
  } = useLessonPage();

  if (isCourseLoading || (courseId && isContentLoading) || !initialLessonSelected) {
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
      <CustomContextMenu isAdmin={false} />
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
            <LessonContentPlayer
              activeChapter={activeChapter}
              courseId={courseId}
              playgroundLaunched={playgroundLaunched}
              setPlaygroundLaunched={setPlaygroundLaunched}
              markChapterComplete={markChapterComplete}
              allChapters={allChapters}
              handleNextLesson={handleNextLesson}
              glow={glow}
              isFullscreen={isFullscreen}
              playerContainerRef={playerContainerRef}
              isVideoLoading={isVideoLoading}
              activeVideoUrl={activeVideoUrl}
              isExtensionDetected={isExtensionDetected}
              resetExtensionGuard={resetExtensionGuard}
              ytContainerRef={ytContainerRef}
              videoEnded={videoEnded}
              togglePlay={togglePlay}
              handleRewatch={handleRewatch}
              hasSavedProgress={hasSavedProgress}
              handleResume={handleResume}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              handleSeek={handleSeek}
              toggleFullscreen={toggleFullscreen}
            />

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

            <LessonDetailsAndNotes
              glow={glow}
              activeChapter={activeChapter}
              courseTitle={courseTitle}
            />

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

          <LessonSidebar
            glow={glow}
            progressPercentage={progressPercentage}
            completedCount={completedCount}
            totalChapters={totalChapters}
            resolvedModules={resolvedModules}
            allChapters={allChapters}
            completedChapters={completedChapters}
            activeChapter={activeChapter}
            open={open}
            setOpen={setOpen}
            setSelectedChapterId={setSelectedChapterId}
            totalDurationStr={totalDurationStr}
            localProgress={localProgress}
          />
        </MagicBentoSection>
      </div>
    </main>
  );
}
