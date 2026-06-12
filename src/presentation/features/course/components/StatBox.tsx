import { MagicBentoCard } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";

interface StatBoxProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

export function StatBox({ icon, value, label }: StatBoxProps) {
  const glow = useAccentRgb();
  return (
    <MagicBentoCard
      className="rounded-lg border border-border bg-card px-3 py-2.5"
      glowColor={glow}
      particleCount={6}
      enableTilt
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-primary">{icon}</span>
        <div className="leading-tight">
          <div className="text-[12px] font-semibold text-foreground/90">{value}</div>
          <div className="text-[11px] text-muted-foreground">{label}</div>
        </div>
      </div>
    </MagicBentoCard>
  );
}
