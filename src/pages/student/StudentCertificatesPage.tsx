import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { Sparkles, Award } from "lucide-react";
import { MagicBentoCard } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";

export function StudentCertificatesPage() {
  const glow = useAccentRgb();
  return (
    <main className="relative flex-1 w-full overflow-hidden bg-background py-8 md:py-12 flex items-center justify-center min-h-[400px]">
      <div className="relative w-full px-4 md:px-6 flex justify-center">
        <MagicBentoCard
          className="group relative flex flex-col rounded-2xl border border-border bg-card p-10 max-w-md w-full transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)] text-center space-y-6"
          glowColor={glow}
          enableStars
        >
          {/* Decorative Pattern */}
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
              backgroundSize: "12px 12px",
            }}
          />
          <div className="mx-auto w-fit p-4 rounded-2xl bg-gradient-to-br from-[var(--accent-cyan)]/10 to-[var(--accent-violet)]/10 border border-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]">
            <Award className="h-10 w-10" />
          </div>
          <div className="space-y-4 relative z-10">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-[var(--accent-cyan)]">
              <span className="size-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
              Under Development
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-mono uppercase">
              Student Certificates
            </h2>
            <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground leading-relaxed">
              Your earned credentials, verified course completion badges, and printable PDF
              certificates will be available right here upon course completion.
            </p>
          </div>
        </MagicBentoCard>
      </div>
    </main>
  );
}
