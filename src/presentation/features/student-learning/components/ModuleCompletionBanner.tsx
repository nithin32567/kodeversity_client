/**
 * ModuleCompletionBanner.tsx
 * Floating callout that appears when a student finishes the last lesson
 * of a sequential module. Drives the unlock request workflow with
 * three distinct visual states:
 *   A — Complete & Unsubmitted  → "Request Instructor to Unlock"
 *   B — Submitted & Waiting     → amber warning / disabled state
 *   C — Approved                → smooth fade-out + lock icon removes
 */
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Unlock, ChevronRight, PartyPopper, ShieldCheck } from "lucide-react";
import { useRequestModuleUnlockMutation } from "@/features/curriculum/curriculumApi";
import type { UnlockRequestStatus } from "@/features/curriculum/curriculumApi";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BannerState = "UNSUBMITTED" | "PENDING" | "APPROVED" | "HIDDEN";

interface ModuleCompletionBannerProps {
  /** The slug of the current course (for the API call) */
  courseSlug: string;
  /** Module ID whose unlock is being requested */
  moduleId: string;
  /** Title of the completed module, displayed in the banner */
  moduleName: string;
  /** Title of the next module to unlock */
  nextModuleName?: string;
  /**
   * Pre-existing server state: if a PENDING or APPROVED request exists
   * already (e.g., from page re-hydration), pass it here so the banner
   * starts in the correct state.
   */
  existingRequestStatus?: UnlockRequestStatus | null;
  /** Called once the banner fully fades out after approval */
  onApproved?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ModuleCompletionBanner({
  courseSlug,
  moduleId,
  moduleName,
  nextModuleName,
  existingRequestStatus,
  onApproved,
}: ModuleCompletionBannerProps) {
  const [bannerState, setBannerState] = useState<BannerState>(() => {
    if (existingRequestStatus === "APPROVED") return "APPROVED";
    if (existingRequestStatus === "PENDING") return "PENDING";
    return "UNSUBMITTED";
  });

  const [visible, setVisible] = useState(true);

  const [requestUnlock, { isLoading }] = useRequestModuleUnlockMutation();

  // When banner hits APPROVED, start the fade-out sequence after a beat
  useEffect(() => {
    if (bannerState === "APPROVED") {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onApproved?.(), 600); // allow CSS transition to finish
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [bannerState, onApproved]);

  const handleRequestUnlock = async () => {
    try {
      const result = await requestUnlock({ courseSlug, moduleId }).unwrap();
      if (result.status === "APPROVED") {
        setBannerState("APPROVED");
        toast.success("Module unlocked immediately!");
      } else {
        setBannerState("PENDING");
        toast.success("Unlock request sent to your instructor.");
      }
    } catch {
      toast.error("Failed to send unlock request. Please try again.");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
        // State-specific color themes
        bannerState === "APPROVED"
          ? "border-emerald-500/30 bg-emerald-500/8"
          : bannerState === "PENDING"
            ? "border-amber-500/30 bg-amber-500/8"
            : "border-violet-500/30 bg-violet-500/8",
      ].join(" ")}
    >
      {/* Ambient glow blob */}
      <div
        className={[
          "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl",
          bannerState === "APPROVED"
            ? "bg-emerald-500/15"
            : bannerState === "PENDING"
              ? "bg-amber-500/15"
              : "bg-violet-500/15",
        ].join(" ")}
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: icon + copy */}
        <div className="flex items-start gap-3">
          <div
            className={[
              "mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full",
              bannerState === "APPROVED"
                ? "bg-emerald-500/15"
                : bannerState === "PENDING"
                  ? "bg-amber-500/15"
                  : "bg-violet-500/15",
            ].join(" ")}
          >
            {bannerState === "APPROVED" ? (
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            ) : bannerState === "PENDING" ? (
              <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
            ) : (
              <PartyPopper className="h-5 w-5 text-violet-400" />
            )}
          </div>

          <div className="min-w-0">
            {bannerState === "APPROVED" ? (
              <>
                <p className="text-sm font-semibold text-emerald-300">🎉 Next Module Unlocked!</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your instructor approved access to{" "}
                  <span className="font-medium text-foreground">
                    {nextModuleName ?? "the next module"}
                  </span>
                  . Continue your journey below.
                </p>
              </>
            ) : bannerState === "PENDING" ? (
              <>
                <p className="text-sm font-semibold text-amber-300">Awaiting Instructor Review…</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your request to unlock{" "}
                  <span className="font-medium text-foreground">
                    {nextModuleName ?? "the next module"}
                  </span>{" "}
                  is under review. Next module opens upon approval.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-violet-300">
                  <CheckCircle2 className="mr-1 inline h-4 w-4 text-violet-400" />
                  Module Complete — "{moduleName}"
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  You've finished every lesson in this module. Request your instructor to unlock the
                  next one.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right: CTA */}
        {bannerState === "UNSUBMITTED" && (
          <button
            id="request-module-unlock-btn"
            onClick={handleRequestUnlock}
            disabled={isLoading}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Sending…
              </>
            ) : (
              <>
                <Unlock className="h-3.5 w-3.5" />
                Request Instructor to Unlock Next Module
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}

        {bannerState === "PENDING" && (
          <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-400">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            Under Review
          </div>
        )}
      </div>
    </div>
  );
}
