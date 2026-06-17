/**
 * PlaygroundStatusOverlay.tsx — Premium overlay UI shown during the
 * playground lifecycle phases: provisioning, polling, connecting, error.
 *
 * Uses the LMS design system tokens (oklch colors, CSS vars, etc.)
 * and includes micro-animations for each phase transition.
 */

import { AlertCircle, Loader2, RefreshCcw, Terminal, Wifi, Server, Check, Zap } from "lucide-react";
import type { PlaygroundInstance } from "@/domain/playground";

// ─── Phase Metadata ─────────────────────────────────────────────────────────

interface PhaseInfo {
  icon: React.ReactNode;
  label: string;
  progress: number; // 0–100
}

function getPhaseInfo(phase: PlaygroundInstance["phase"]): PhaseInfo {
  switch (phase) {
    case "IDLE":
      return { icon: <Terminal className="h-6 w-6" />, label: "Initializing", progress: 0 };
    case "GENERATING_ID":
      return { icon: <Zap className="h-6 w-6" />, label: "Allocating Instance", progress: 15 };
    case "CREATING":
      return { icon: <Server className="h-6 w-6" />, label: "Spinning Up Container", progress: 35 };
    case "POLLING":
      return { icon: <Loader2 className="h-6 w-6 animate-spin" />, label: "Booting Environment", progress: 55 };
    case "CONNECTING":
      return { icon: <Wifi className="h-6 w-6" />, label: "Establishing Connection", progress: 80 };
    case "READY":
      return { icon: <Check className="h-6 w-6" />, label: "Ready", progress: 100 };
    case "VALIDATING":
      return { icon: <Loader2 className="h-6 w-6 animate-spin" />, label: "Running Tests", progress: 90 };
    case "SCORING":
      return { icon: <Zap className="h-6 w-6" />, label: "Recording Score", progress: 95 };
    case "TEARING_DOWN":
      return { icon: <Loader2 className="h-6 w-6 animate-spin" />, label: "Cleaning Up", progress: 50 };
    case "DESTROYED":
      return { icon: <Check className="h-6 w-6" />, label: "Destroyed", progress: 0 };
    case "ERROR":
      return { icon: <AlertCircle className="h-6 w-6" />, label: "Error", progress: 0 };
    default:
      return { icon: <Loader2 className="h-6 w-6 animate-spin" />, label: "Processing", progress: 50 };
  }
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface PlaygroundStatusOverlayProps {
  instance: PlaygroundInstance;
  onRetry: () => void;
  onCancel?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PlaygroundStatusOverlay({
  instance,
  onRetry,
  onCancel,
}: PlaygroundStatusOverlayProps) {
  const phaseInfo = getPhaseInfo(instance.phase);
  const isError = instance.phase === "ERROR";

  return (
    <div className="flex-1 flex items-center justify-center bg-background/95 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-md">
        {/* Animated glow ring */}
        {!isError && (
          <div className="absolute -inset-8 rounded-3xl opacity-20 blur-3xl bg-[image:var(--gradient-primary)] animate-pulse" />
        )}

        <div
          className={`relative rounded-2xl border p-8 shadow-2xl text-center ${
            isError
              ? "bg-card border-destructive/30"
              : "bg-card border-border"
          }`}
        >
          {/* Phase icon */}
          <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
              isError
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            }`}
          >
            {phaseInfo.icon}
          </div>

          {/* Phase label */}
          <h3 className="text-lg font-bold text-foreground mb-1">
            {phaseInfo.label}
          </h3>

          {/* Status message */}
          <p className="text-sm text-muted-foreground mb-6 min-h-[1.25rem]">
            {instance.statusMessage}
          </p>

          {/* Progress bar (non-error) */}
          {!isError && (
            <div className="w-full mb-6">
              <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[image:var(--gradient-primary)] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${phaseInfo.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {phaseInfo.progress}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Please wait…
                </span>
              </div>
            </div>
          )}

          {/* Error state actions */}
          {isError && (
            <div className="flex flex-col gap-3">
              <button
                onClick={onRetry}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-primary)] transition-transform hover:scale-[1.02]"
              >
                <RefreshCcw className="h-4 w-4" />
                Retry
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {/* Cancel during provisioning */}
          {!isError && instance.phase !== "READY" && onCancel && (
            <button
              onClick={onCancel}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground transition"
            >
              Cancel provisioning
            </button>
          )}

          {/* Phase steps indicator */}
          {!isError && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {(["GENERATING_ID", "CREATING", "POLLING", "CONNECTING", "READY"] as const).map(
                (step, i) => {
                  const stepProgress = getPhaseInfo(step).progress;
                  const currentProgress = phaseInfo.progress;
                  const isComplete = currentProgress >= stepProgress;
                  const isCurrent =
                    currentProgress >= stepProgress &&
                    currentProgress < (getPhaseInfo((["GENERATING_ID", "CREATING", "POLLING", "CONNECTING", "READY"] as const)[i + 1] ?? "READY").progress);

                  return (
                    <div
                      key={step}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isComplete
                          ? "w-6 bg-primary"
                          : isCurrent
                            ? "w-6 bg-primary/50 animate-pulse"
                            : "w-1.5 bg-foreground/10"
                      }`}
                    />
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
