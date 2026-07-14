import { useEffect, useRef, useState } from "react";

export function extractYtId(url: string): string | null {
  return (
    url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    )?.[1] ?? null
  );
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export interface UseYouTubePlayerOptions {
  /** Called when the student reaches the 90% watch threshold (or video naturally ends). */
  onEnded: (chapterId: string) => void;
  /**
   * Called every ~500 ms with the latest currentTime and duration.
   * Use this to throttle-save progress to the backend.
   */
  onProgress?: (currentTime: number, duration: number) => void;
  /**
   * If provided, the player will seek to this position (in seconds) as soon as it is ready.
   * Pass the student's saved watchTime to enable resume-from-where-you-left-off.
   */
  resumeFromTime?: number;
}

export function useYouTubePlayer(
  activeVideoUrl: string | null,
  activeChapterId: string | null,
  optionsOrCallback: UseYouTubePlayerOptions | ((chapterId: string) => void),
) {
  // Accept both the legacy (fn) and new (options) calling convention
  const options: UseYouTubePlayerOptions =
    typeof optionsOrCallback === "function"
      ? { onEnded: optionsOrCallback }
      : optionsOrCallback;

  const { onEnded, onProgress, resumeFromTime = 0 } = options;

  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YT.Player | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Track whether we have already fired the 90%-completion callback so we
  // don't fire it repeatedly on every tick.
  const completionFiredRef = useRef(false);
  // Keep a stable ref to the latest resumeFromTime so the onReady handler
  // can access the current value without being a dependency.
  const resumeFromTimeRef = useRef(resumeFromTime);
  resumeFromTimeRef.current = resumeFromTime;

  const resetVideoEnded = () => setVideoEnded(false);

  useEffect(() => {
    if (!activeVideoUrl) return;
    const isYouTube = activeVideoUrl.includes("youtube.com") || activeVideoUrl.includes("youtu.be");
    if (!isYouTube) return;

    const videoId = extractYtId(activeVideoUrl);
    if (!videoId) return;

    setVideoEnded(false);
    completionFiredRef.current = false;

    const initPlayer = () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (_) {
          /* ignore */
        }
        ytPlayerRef.current = null;
      }
      if (!ytContainerRef.current) return;

      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId,
        playerVars: { autoplay: 0, rel: 0, controls: 0, modestbranding: 1, iv_load_policy: 3 },
        events: {
          onReady: () => {
            // Seek to resume position if available
            const resumeAt = resumeFromTimeRef.current;
            if (resumeAt > 0) {
              try {
                ytPlayerRef.current?.seekTo(resumeAt, true);
              } catch (_) {
                /* ignore */
              }
            }
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            setIsPlaying(event.data === 1);
            if (event.data === 0) {
              // Natural video end — always treat as complete
              if (!completionFiredRef.current) {
                completionFiredRef.current = true;
                if (activeChapterId) onEnded(activeChapterId);
              }
              setVideoEnded(true);
              setIsPlaying(false);
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("yt-iframe-api-script")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        initPlayer();
      };
    }

    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (_) {
          /* ignore */
        }
        ytPlayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideoUrl]);

  // Poll for progress bar updates + 90% completion gate
  useEffect(() => {
    const id = setInterval(() => {
      const p = ytPlayerRef.current;
      if (!p) return;
      try {
        const ct = p.getCurrentTime();
        const dur = p.getDuration();
        if (isFinite(ct)) setCurrentTime(ct);
        if (isFinite(dur) && dur > 0) setDuration(dur);

        // Fire onProgress callback for parent to throttle-save to backend
        if (isFinite(ct) && isFinite(dur) && dur > 0) {
          onProgress?.(ct, dur);
        }

        // 90% gate: unlock next lesson without waiting for the video to fully end
        if (!completionFiredRef.current && isFinite(ct) && isFinite(dur) && dur > 0) {
          const pct = ct / dur;
          if (pct >= 0.9 && activeChapterId) {
            completionFiredRef.current = true;
            onEnded(activeChapterId);
          }
        }
      } catch (_) {
        /* not ready */
      }
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapterId, onEnded, onProgress]);

  return {
    ytContainerRef,
    ytPlayerRef,
    isPlaying,
    videoEnded,
    currentTime,
    duration,
    resetVideoEnded,
  };
}
