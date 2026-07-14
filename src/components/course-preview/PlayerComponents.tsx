import {
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  Play,
  ChevronRight,
  PartyPopper,
  Maximize,
  Minimize,
} from "lucide-react";
import { formatDuration } from "./useYouTubePlayer";
import type { RefObject } from "react";

// ── Security Fallback overlay ─────────────────────────────────────────────────
export function SecurityAlertOverlay({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center"
      style={{
        background:
          "radial-gradient(ellipse at center, color-mix(in oklab, #ef4444 18%, #0c0405) 0%, #07040a 70%)",
      }}
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-28 w-28 rounded-full bg-red-500/15 animate-ping" />
        <span className="relative inline-flex h-20 w-20 rounded-full bg-red-500/10 border-2 border-red-400/50 items-center justify-center">
          <ShieldAlert className="h-10 w-10 text-red-400 drop-shadow-[0_0_14px_rgba(239,68,68,0.9)]" />
        </span>
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-bold text-red-300 tracking-tight">Security Alert</h2>
        <p className="text-sm text-white/70 leading-relaxed">
          External extension detected. Please disable video download managers&nbsp;/ extensions to
          resume your lesson.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all px-5 py-2.5 text-sm font-semibold text-red-300 backdrop-blur"
      >
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    </div>
  );
}

// ── Chapter Completed overlay ─────────────────────────────────────────────────
export function ChapterCompletedOverlay({
  hasNext,
  onRewatch,
  onNext,
}: {
  hasNext: boolean;
  onRewatch: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
      style={{
        background:
          "radial-gradient(ellipse at center, color-mix(in oklab, #10b981 28%, #030c0a) 0%, #030c0a 68%)",
      }}
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-32 w-32 rounded-full bg-emerald-500/20 animate-ping" />
        <span className="relative inline-flex h-24 w-24 rounded-full bg-emerald-500/10 border-2 border-emerald-400/50 items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 drop-shadow-[0_0_16px_rgba(52,211,153,1)]" />
        </span>
      </div>
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <PartyPopper className="h-5 w-5 text-amber-400" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Chapter Completed!</h2>
          <PartyPopper className="h-5 w-5 text-amber-400 scale-x-[-1]" />
        </div>
        <p className="text-sm text-white/60 max-w-xs mx-auto">
          Congratulations! You have completed this chapter.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onRewatch}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 transition-all px-5 py-2.5 text-sm font-medium text-white backdrop-blur"
        >
          <Play className="h-3.5 w-3.5 fill-current" /> Re-watch
        </button>
        {hasNext && (
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_22px_rgba(52,211,153,0.55)]"
          >
            Next Lesson <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Video Progress Bar ─────────────────────────────────────────────────────────
export function VideoProgressBar({
  isPlaying,
  currentTime,
  duration,
  isFullscreen,
  onTogglePlay,
  onSeek,
  onToggleFullscreen,
}: {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  onTogglePlay: () => void;
  onSeek: (value: number) => void;
  onToggleFullscreen: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card px-5 py-4 flex flex-col gap-3 ${isFullscreen ? "mt-auto" : ""}`}
    >
      <div className="relative flex items-center gap-3">
        <button
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={onTogglePlay}
          className="shrink-0 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-[var(--shadow-primary)]"
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <Play className="h-3.5 w-3.5 translate-x-px fill-current" />
          )}
        </button>

        <span className="shrink-0 font-mono text-[11px] text-muted-foreground w-[38px] text-right tabular-nums">
          {formatDuration(Math.floor(currentTime))}
        </span>

        <div className="relative flex-1 flex items-center">
          <div className="absolute inset-y-0 flex items-center w-full pointer-events-none">
            <div className="w-full h-1.5 rounded-full bg-border" />
            <div
              className="absolute h-1.5 rounded-full bg-primary transition-[width] duration-200"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
            />
            {duration > 0 && (
              <div
                className="absolute h-3 w-3 rounded-full bg-primary ring-2 ring-background shadow-md -translate-x-1/2"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            )}
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="relative w-full h-4 opacity-0 cursor-pointer"
          />
        </div>

        <span className="shrink-0 font-mono text-[11px] text-muted-foreground w-[38px] tabular-nums">
          {formatDuration(Math.floor(duration))}
        </span>

        <button
          onClick={onToggleFullscreen}
          className="shrink-0 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-all ml-1"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ── No-video placeholder ───────────────────────────────────────────────────────
export function VideoPlaceholder({ title, onNext }: { title: string; onNext: () => void }) {
  return (
    <div
      className="relative grid aspect-[16/8] w-full place-items-center"
      style={{
        background:
          "radial-gradient(ellipse at center, color-mix(in oklab, var(--accent-violet) 35%, #0b0a1f) 0%, #06050f 70%)",
      }}
    >
      <button
        onClick={onNext}
        className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur hover:bg-background/80"
      >
        Next Lesson <ChevronRight className="h-3.5 w-3.5" />
      </button>
      <div className="absolute left-8 top-1/2 max-w-sm -translate-y-1/2">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">Video Lesson</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-xs text-foreground/70">Press play to start watching.</p>
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
  );
}

// ── Loading Spinner ────────────────────────────────────────────────────────────
export function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
    </div>
  );
}

// ── Interaction Shield ─────────────────────────────────────────────────────────
export function InteractionShield({
  containerRef,
  onTogglePlay,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  onTogglePlay: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-10 cursor-pointer"
      title="Click to play / pause"
      onClick={onTogglePlay}
    />
  );
}
