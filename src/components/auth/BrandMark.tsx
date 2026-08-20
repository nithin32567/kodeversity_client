import kodeversityLogo from "@/assets/kodeversity-logo.png";

/**
 * Brand lockup: logo + "LMS" sub-label.
 * Always rendered with white text so it works on the dark auth-panel background.
 */
export function BrandMark() {
  return (
    <div className="relative flex items-center gap-3">
      <img
        src={kodeversityLogo}
        alt="Kodeversity"
        className="h-8 w-auto brightness-0 invert"
      />
      <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
        LMS
      </span>
    </div>
  );
}
