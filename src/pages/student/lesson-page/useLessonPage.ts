import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useCourse } from "@/presentation/features/student-learning/hooks/useCourses";
import {
  useGetChapterVideoQuery,
  useGetCourseContentQuery,
  useUpdateLessonProgressMutation,
  useGetMyCourseProgressQuery,
} from "@/features/course/courseApi";
import { ChapterDisplay } from "./types";
import { mockModules } from "./mockData";
import { useYouTubePlayer } from "@/components/course-preview/useYouTubePlayer";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { usePageProtection } from "@/hooks/usePageProtection";
import { useExtensionGuard } from "@/components/course-preview/ExtensionGuard";

const BACKEND_SAVE_INTERVAL_MS = 5_000;

const LS_SAVE_INTERVAL_MS = 1_000;

const BYPASS_ACCESS_METHODS = new Set(["FULL_ACCESS", "ADMIN_OVERRIDE", "INSTRUCTOR_OVERRIDE"]);

interface ProgressEntry {
  watchTime: number;
  percentage: number;
  isCompleted: boolean;
}
type ProgressStore = Record<string, ProgressEntry>;

function lsKey(courseId: string) {
  return `lms:progress:${courseId}`;
}

function loadProgressStore(courseId: string): ProgressStore {
  try {
    const raw = localStorage.getItem(lsKey(courseId));
    return raw ? (JSON.parse(raw) as ProgressStore) : {};
  } catch {
    return {};
  }
}

function saveProgressStore(courseId: string, store: ProgressStore) {
  try {
    localStorage.setItem(lsKey(courseId), JSON.stringify(store));
  } catch {}
}

function upsertProgressEntry(
  courseId: string,
  lessonId: string,
  patch: Partial<ProgressEntry>,
): ProgressStore {
  const store = loadProgressStore(courseId);
  const existing = store[lessonId] ?? { watchTime: 0, percentage: 0, isCompleted: false };
  store[lessonId] = {
    watchTime: Math.max(existing.watchTime, patch.watchTime ?? 0),
    percentage: Math.max(existing.percentage, patch.percentage ?? 0),
    isCompleted: existing.isCompleted || (patch.isCompleted ?? false),
  };
  saveProgressStore(courseId, store);
  return store;
}

function applySequentialLocks(modules: unknown[], completedChapters: Set<string>): unknown[] {
  let lastChapterId: string | null = null;

  return (modules as Record<string, unknown>[]).map((mod, modIdx) => {
    const rawChapters = (mod.chapters as Record<string, unknown>[] | undefined) ?? [];

    let moduleIsLocked: boolean;
    if (modIdx === 0) {
      moduleIsLocked = false;
    } else {
      const prevMod = (modules as Record<string, unknown>[])[modIdx - 1];
      const prevChapters = (prevMod.chapters as { id: string }[] | undefined) ?? [];
      moduleIsLocked = prevChapters.some((ch) => !completedChapters.has(ch.id));
    }

    const chapters = rawChapters.map((ch, chIdx) => {
      let chapterIsLocked: boolean;

      if (moduleIsLocked) {
        chapterIsLocked = true;
      } else if (modIdx === 0 && chIdx === 0) {
        chapterIsLocked = false;
      } else {
        chapterIsLocked = lastChapterId === null || !completedChapters.has(lastChapterId);
      }

      lastChapterId = ch.id as string;
      return { ...ch, isLocked: chapterIsLocked };
    });

    return { ...mod, isLocked: moduleIsLocked, chapters };
  });
}

export function useLessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: realCourse, isLoading: isCourseLoading } = useCourse(slug || "mock-course");

  const courseId = realCourse?.id;

  const { data: contentData, isLoading: isContentLoading } = useGetCourseContentQuery(
    courseId || "",
    { skip: !courseId },
  );

  const { data: progressData, isLoading: isProgressLoading } = useGetMyCourseProgressQuery(
    courseId || "",
    {
      skip: !courseId,
    },
  );

  const [initialLessonSelected, setInitialLessonSelected] = useState(false);

  const [updateLessonProgress] = useUpdateLessonProgressMutation();

  const [activeTab, setActiveTab] = useState("Overview");
  const [open, setOpen] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: false,
    3: false,
    4: false,
  });

  const contentDataAny = contentData as any;
  const accessMethod: string = contentDataAny?.accessMethod ?? "SEQUENTIAL";

  const rawModules =
    contentDataAny?.data && Array.isArray(contentDataAny.data) && contentDataAny.data.length > 0
      ? contentDataAny.data
      : realCourse?.modules && realCourse.modules.length > 0
        ? realCourse.modules
        : mockModules;

  const courseTitle = realCourse?.title || "Course Player";

  const allChaptersRaw = (rawModules as { chapters?: unknown[] }[]).flatMap(
    (m) => (m.chapters ?? []) as ChapterDisplay[],
  );

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const activeChapter =
    allChaptersRaw.find((c) => c.id === selectedChapterId) ||
    (initialLessonSelected ? allChaptersRaw[0] : null) ||
    null;

  const { data: videoData, isFetching: isVideoLoading } = useGetChapterVideoQuery(
    activeChapter?.id || "",
    { skip: !activeChapter || !activeChapter.id || activeChapter.type !== "VIDEO" },
  );

  const activeVideoUrl = !isVideoLoading && videoData?.success ? videoData.videoUrl : null;

  const [localProgress, setLocalProgress] = useState<
    Map<string, { watchTime: number; percentage: number }>
  >(new Map());
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!courseId) return;

    const store = loadProgressStore(courseId);
    if (Object.keys(store).length === 0) return;

    const completed = new Set<string>();
    const progressMap = new Map<string, { watchTime: number; percentage: number }>();

    for (const [lessonId, entry] of Object.entries(store)) {
      if (entry.isCompleted) completed.add(lessonId);
      progressMap.set(lessonId, { watchTime: entry.watchTime, percentage: entry.percentage });
    }

    setCompletedChapters(completed);
    setLocalProgress(progressMap);
  }, [courseId]);

  useEffect(() => {
    if (!progressData?.data || !courseId) return;

    const lsStore = loadProgressStore(courseId);

    const completed = new Set<string>();
    const progressMap = new Map<string, { watchTime: number; percentage: number }>();

    for (const record of progressData.data) {
      const lsEntry = lsStore[record.lessonId];

      const watchTime = Math.max(record.watchTime, lsEntry?.watchTime ?? 0);
      const percentage = Math.max(record.percentage, lsEntry?.percentage ?? 0);
      const isCompleted = record.isCompleted || (lsEntry?.isCompleted ?? false);

      if (isCompleted) completed.add(record.lessonId);
      progressMap.set(record.lessonId, { watchTime, percentage });

      lsStore[record.lessonId] = { watchTime, percentage, isCompleted };
    }

    for (const [lessonId, entry] of Object.entries(lsStore)) {
      if (!progressMap.has(lessonId)) {
        if (entry.isCompleted) completed.add(lessonId);
        progressMap.set(lessonId, { watchTime: entry.watchTime, percentage: entry.percentage });
      }
    }

    saveProgressStore(courseId, lsStore);
    setCompletedChapters(completed);
    setLocalProgress(progressMap);
  }, [progressData, courseId]);

  const resolvedModules = BYPASS_ACCESS_METHODS.has(accessMethod)
    ? rawModules
    : applySequentialLocks(rawModules, completedChapters);

  const allChapters = (resolvedModules as { chapters?: unknown[] }[]).flatMap(
    (m) => (m.chapters ?? []) as ChapterDisplay[],
  );

  useEffect(() => {
    if (initialLessonSelected) return;
    if (!courseId) return;
    if (isContentLoading || isProgressLoading) return;

    if (allChapters.length === 0) {
      setInitialLessonSelected(true);
      return;
    }

    let targetLessonId: string | null = null;

    const lastAccessedId = localStorage.getItem(`lms:lastAccessed:${courseId}`);
    if (lastAccessedId) {
      const lastAccessedChapter = allChapters.find((c) => c.id === lastAccessedId);

      if (
        lastAccessedChapter &&
        !(lastAccessedChapter as any).isLocked &&
        !completedChapters.has(lastAccessedId)
      ) {
        targetLessonId = lastAccessedId;
      }
    }

    if (!targetLessonId) {
      const firstUnlockedIncomplete = allChapters.find(
        (c) => !(c as any).isLocked && !completedChapters.has(c.id),
      );
      if (firstUnlockedIncomplete) {
        targetLessonId = firstUnlockedIncomplete.id;
      }
    }

    if (!targetLessonId && lastAccessedId) {
      const lastAccessedChapter = allChapters.find((c) => c.id === lastAccessedId);
      if (lastAccessedChapter && !(lastAccessedChapter as any).isLocked) {
        targetLessonId = lastAccessedId;
      }
    }

    if (!targetLessonId) {
      const completedList = allChapters.filter((c) => completedChapters.has(c.id));
      if (completedList.length > 0) {
        targetLessonId = completedList[completedList.length - 1].id;
      }
    }

    if (!targetLessonId) {
      targetLessonId = allChapters[0]?.id || null;
    }

    if (targetLessonId) {
      setSelectedChapterId(targetLessonId);

      const targetModuleIndex = (resolvedModules as { chapters?: { id: string }[] }[]).findIndex(
        (m) => m.chapters?.some((c) => c.id === targetLessonId),
      );
      if (targetModuleIndex !== -1) {
        setOpen((prev) => ({ ...prev, [targetModuleIndex]: true }));
      }
    }

    setInitialLessonSelected(true);
  }, [
    courseId,
    allChapters,
    completedChapters,
    initialLessonSelected,
    isContentLoading,
    isProgressLoading,
    resolvedModules,
  ]);

  useEffect(() => {
    if (courseId && selectedChapterId) {
      localStorage.setItem(`lms:lastAccessed:${courseId}`, selectedChapterId);
    }
  }, [courseId, selectedChapterId]);

  const resumeFromTime = localProgress.get(activeChapter?.id ?? "")?.watchTime ?? 0;

  const pendingProgressRef = useRef<{ currentTime: number; duration: number } | null>(null);
  const lastBackendSaveRef = useRef<number>(0);
  const lastLsSaveRef = useRef<number>(0);

  const [completedModuleId, setCompletedModuleId] = useState<string | null>(null);

  const markChapterComplete = useCallback(
    (id: string) => {
      if (courseId) {
        upsertProgressEntry(courseId, id, { isCompleted: true, percentage: 100 });

        const currentDur = pendingProgressRef.current?.duration || 0;
        updateLessonProgress({
          lessonId: id,
          percentage: 100,
          watchTime: currentDur > 0 ? currentDur : 9999,
          courseId,
        }).catch(() => {});
      }

      setCompletedChapters((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      setLocalProgress((prev) => {
        const existing = prev.get(id);
        const next = new Map(prev);
        next.set(id, {
          watchTime: existing?.watchTime ?? 0,
          percentage: 100,
        });
        return next;
      });

      for (const mod of resolvedModules as { id: string; chapters?: { id: string }[] }[]) {
        const chapters = mod.chapters ?? [];
        if (chapters.length > 0 && chapters[chapters.length - 1].id === id) {
          setCompletedModuleId(mod.id);
          break;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedModules, courseId],
  );

  const handleVideoProgress = useCallback(
    (currentTime: number, duration: number) => {
      if (!activeChapter || !courseId) return;

      const chapterId = activeChapter.id;
      pendingProgressRef.current = { currentTime, duration };

      const now = Date.now();
      const percentage = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
      const watchTime = Math.round(currentTime);

      if (now - lastLsSaveRef.current >= LS_SAVE_INTERVAL_MS) {
        lastLsSaveRef.current = now;

        upsertProgressEntry(courseId, chapterId, { watchTime, percentage });

        setLocalProgress((prev) => {
          const existing = prev.get(chapterId);
          if (existing && existing.watchTime >= watchTime) return prev;
          const next = new Map(prev);
          next.set(chapterId, { watchTime, percentage });
          return next;
        });
      }

      if (now - lastBackendSaveRef.current >= BACKEND_SAVE_INTERVAL_MS) {
        lastBackendSaveRef.current = now;
        updateLessonProgress({ lessonId: chapterId, percentage, watchTime, courseId }).catch(
          (err) => console.warn("[progress] backend save failed", err),
        );
      }
    },
    [activeChapter, courseId, updateLessonProgress],
  );

  const {
    ytContainerRef,
    ytPlayerRef,
    isPlaying,
    videoEnded,
    currentTime,
    duration,
    resetVideoEnded,
  } = useYouTubePlayer(activeVideoUrl, activeChapter?.id ?? null, {
    onEnded: markChapterComplete,
    onProgress: handleVideoProgress,
    resumeFromTime,
  });

  const [playerHasStarted, setPlayerHasStarted] = useState(false);

  useEffect(() => {
    if (isPlaying) setPlayerHasStarted(true);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      const pending = pendingProgressRef.current;
      if (!pending || !activeChapter || !courseId) return;

      const { currentTime: ct, duration: dur } = pending;
      const percentage = dur > 0 ? Math.min(100, (ct / dur) * 100) : 0;
      const watchTime = Math.round(ct);

      upsertProgressEntry(courseId, activeChapter.id, { watchTime, percentage });

      updateLessonProgress({
        lessonId: activeChapter.id,
        percentage,
        watchTime,
        courseId,
      }).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapter?.id, courseId]);

  useEffect(() => {
    const handleUnload = () => {
      const pending = pendingProgressRef.current;
      if (!pending || !activeChapter?.id || !courseId) return;
      const { currentTime: ct, duration: dur } = pending;
      const percentage = dur > 0 ? Math.min(100, (ct / dur) * 100) : 0;
      upsertProgressEntry(courseId, activeChapter.id, {
        watchTime: Math.round(ct),
        percentage,
      });
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [activeChapter?.id, courseId]);

  const [playgroundLaunched, setPlaygroundLaunched] = useState(false);

  const prevChapterIdRef = useState<string | null>(null);
  if (prevChapterIdRef[0] !== (activeChapter?.id ?? null)) {
    prevChapterIdRef[1](activeChapter?.id ?? null);
    if (playgroundLaunched) setPlaygroundLaunched(false);

    pendingProgressRef.current = null;
    lastBackendSaveRef.current = 0;
    lastLsSaveRef.current = 0;

    setPlayerHasStarted(false);
  }

  const handleNextLesson = () => {
    if (!activeChapter) return;
    const currentIdx = allChapters.findIndex((c) => c.id === activeChapter.id);
    if (currentIdx !== -1 && currentIdx < allChapters.length - 1) {
      const next = allChapters[currentIdx + 1];
      if ((next as ChapterDisplay & { isLocked?: boolean }).isLocked) return;
      setSelectedChapterId(next.id);
    }
  };

  const totalChapters = allChapters.length;
  const completedCount = allChapters.filter((c) => completedChapters.has(c.id)).length;
  const progressPercentage =
    totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
  const totalDurationSeconds = allChapters.reduce(
    (acc, ch) => acc + (ch.durationInSeconds || ch.duration || 0),
    0,
  );
  const totalDurationStr = `${Math.floor(totalDurationSeconds / 3600)}h ${Math.floor((totalDurationSeconds % 3600) / 60)}m`;

  const glow = useAccentRgb();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  usePageProtection();

  const { isExtensionDetected, reset: resetExtensionGuard } = useExtensionGuard(playerContainerRef);

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
    if (isPlaying) p.pauseVideo();
    else p.playVideo();
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

  const handleResume = () => {
    const savedTime = localProgress.get(activeChapter?.id ?? "")?.watchTime ?? 0;
    if (savedTime > 0) {
      ytPlayerRef.current?.seekTo(savedTime, true);
      ytPlayerRef.current?.playVideo();
    }
  };

  const hasSavedProgress =
    activeChapter?.type === "VIDEO" &&
    !completedChapters.has(activeChapter.id) &&
    (localProgress.get(activeChapter.id)?.watchTime ?? 0) > 5 &&
    !playerHasStarted;

  return {
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
    isPlaying,
    videoEnded,
    currentTime,
    duration,
    resetVideoEnded,
    ytContainerRef,
    ytPlayerRef,
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
    localProgress,
    hasSavedProgress,
    handleResume,
    glow,
    isFullscreen,
    playerContainerRef,
    isExtensionDetected,
    resetExtensionGuard,
    toggleFullscreen,
    togglePlay,
    handleSeek,
    handleRewatch,
    initialLessonSelected,
  };
}
