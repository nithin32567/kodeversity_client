/* eslint-disable @typescript-eslint/no-explicit-any, no-empty */
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useCourse } from "@/presentation/features/student-learning/hooks/useCourses";
import { useGetChapterVideoQuery, useGetCourseContentQuery } from "@/features/course/courseApi";
import { ChapterDisplay } from "./types";
import { mockModules } from "./mockData";
import { extractYtId } from "./utils";

export function useLessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: realCourse, isLoading: isCourseLoading } = useCourse(slug || "mock-course");

  const courseId = realCourse?.id;

  const { data: contentData, isLoading: isContentLoading } = useGetCourseContentQuery(
    courseId || "",
    { skip: !courseId }
  );

  const [activeTab, setActiveTab] = useState("Overview");
  const [open, setOpen] = useState<Record<number, boolean>>({
    0: true, 1: true, 2: false, 3: false, 4: false,
  });

  const resolvedModules =
    contentData?.data && Array.isArray(contentData.data) && contentData.data.length > 0
      ? contentData.data
      : realCourse?.modules && realCourse.modules.length > 0
        ? realCourse.modules
        : mockModules;

  const courseTitle = realCourse?.title || "Course Player";
  const allChapters = (resolvedModules as { chapters?: unknown[] }[]).flatMap(
    (m) => (m.chapters ?? []) as ChapterDisplay[]
  );

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const activeChapter = allChapters.find((c) => c.id === selectedChapterId) || allChapters[0] || null;

  const { data: videoData, isFetching: isVideoLoading } = useGetChapterVideoQuery(
    activeChapter?.id || "",
    { skip: !activeChapter || !activeChapter.id || activeChapter.type !== "VIDEO" }
  );

  const activeVideoUrl = !isVideoLoading && videoData?.success ? videoData.videoUrl : null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);

  useEffect(() => {
    if (!activeVideoUrl) return;

    const isYouTube = activeVideoUrl.includes("youtube.com") || activeVideoUrl.includes("youtu.be");
    if (!isYouTube) return;

    const videoId = extractYtId(activeVideoUrl);
    if (!videoId) return;

    setVideoEnded(false);

    const initPlayer = () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (_) {}
        ytPlayerRef.current = null;
      }
      if (!ytContainerRef.current) return;

      ytPlayerRef.current = new (window as any).YT.Player(ytContainerRef.current, {
        videoId,
        playerVars: { autoplay: 0, rel: 0, controls: 1, modestbranding: 1 },
        events: {
          onStateChange: (event: any) => {
            setIsPlaying(event.data === 1);
            if (event.data === 0) {
              setVideoEnded(true);
              setIsPlaying(false);
              if (activeChapter) {
                markChapterComplete(activeChapter.id);
              }
            }
          },
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("yt-iframe-api-script")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      const prev = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        initPlayer();
      };
    }

    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (_) {}
        ytPlayerRef.current = null;
      }
    };
  }, [activeVideoUrl, activeChapter]);

  const [playgroundLaunched, setPlaygroundLaunched] = useState(false);

  const prevChapterIdRef = useState<string | null>(null);
  if (prevChapterIdRef[0] !== (activeChapter?.id ?? null)) {
    prevChapterIdRef[1](activeChapter?.id ?? null);
    if (playgroundLaunched) setPlaygroundLaunched(false);
  }

  const [completedChapters, setCompletedChapters] = useState<Set<string>>(
    new Set(["chap-1", "chap-2"])
  );

  const [completedModuleId, setCompletedModuleId] = useState<string | null>(null);

  const markChapterComplete = (id: string) => {
    setCompletedChapters((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

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

  const totalChapters = allChapters.length;
  const completedCount = allChapters.filter((c) => completedChapters.has(c.id)).length;
  const progressPercentage =
    totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
  const totalDurationSeconds = allChapters.reduce(
    (acc, ch) => acc + (ch.durationInSeconds || ch.duration || 0),
    0
  );
  const totalDurationStr = `${Math.floor(totalDurationSeconds / 3600)}h ${Math.floor((totalDurationSeconds % 3600) / 60)}m`;

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
  };
}
