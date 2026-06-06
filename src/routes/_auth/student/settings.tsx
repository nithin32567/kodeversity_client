import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Settings } from "lucide-react";
import { MagicBentoCard } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";

export const Route = createFileRoute("/_auth/student/settings")({
  head: () => ({ meta: [{ title: "Settings — Kodeversity" }] }),
  component: SettingsPage,
});

export function SettingsPage() {
  const glow = useAccentRgb();
  return (
    <main className="flex-1 flex items-center justify-center p-6 min-h-[400px]">
      <MagicBentoCard
        className="max-w-md w-full p-8 rounded-2xl border border-border bg-card text-center space-y-5 shadow-xl"
        glowColor={glow}
        enableStars
      >
        <div className="mx-auto w-fit p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Settings className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3 py-1 text-xs font-semibold text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            Under Development
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display">
            Account Settings
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Manage your account details, security settings, active sessions, notification
            preferences, and subscription invoicing here.
          </p>
        </div>
      </MagicBentoCard>
    </main>
  );
}
