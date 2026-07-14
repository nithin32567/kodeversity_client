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

export function useYouTubePlayer(
  activeVideoUrl: string | null,
  activeChapterId: string | null,
  onEnded: (chapterId: string) => void,
) {
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YT.Player | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const resetVideoEnded = () => setVideoEnded(false);

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
          onReady: () => {},
          onStateChange: (event: YT.OnStateChangeEvent) => {
            setIsPlaying(event.data === 1);
            if (event.data === 0) {
              setVideoEnded(true);
              setIsPlaying(false);
              if (activeChapterId) onEnded(activeChapterId);
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

  // Poll for progress bar updates
  useEffect(() => {
    const id = setInterval(() => {
      const p = ytPlayerRef.current;
      if (!p) return;
      try {
        const ct = p.getCurrentTime();
        const dur = p.getDuration();
        if (isFinite(ct)) setCurrentTime(ct);
        if (isFinite(dur) && dur > 0) setDuration(dur);
      } catch (_) {
        /* not ready */
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

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
