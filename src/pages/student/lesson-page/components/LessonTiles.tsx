import { Link } from "react-router-dom";
import { Folder, CheckCircle2, PlayCircle, Lock } from "lucide-react";
import { MagicBentoCard } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";

export function ActionTile({
  icon,
  title,
  desc,
  cta,
  to,
  params,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  to?: string;
  params?: Record<string, string>;
}) {
  const glow = useAccentRgb();
  const btnClass =
    "mt-4 flex items-center justify-center gap-2 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-cyan)] transition-colors hover:bg-[var(--accent-cyan)]/20 hover:text-white";
  return (
    <MagicBentoCard
      className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)]"
      glowColor={glow}
      enableStars={false}
      enableMagnetism={false}
    >
      <div className="flex items-center gap-2 text-sm font-bold font-mono uppercase tracking-wide">
        {icon} {title}
      </div>
      <p className="mt-2 flex-1 text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      {to ? (
        <Link to={to as string} className={btnClass}>
          <Folder className="h-3.5 w-3.5" /> {cta}
        </Link>
      ) : (
        <button className={btnClass}>
          <Folder className="h-3.5 w-3.5" /> {cta}
        </button>
      )}
    </MagicBentoCard>
  );
}

export function ProgressTile() {
  const glow = useAccentRgb();
  return (
    <MagicBentoCard
      className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-[var(--accent-violet)] hover:shadow-[0_0_30px_-10px_var(--accent-violet)]"
      glowColor={glow}
      enableStars={false}
      enableMagnetism={false}
    >
      <div className="text-sm font-bold font-mono uppercase tracking-wide text-foreground">
        Lesson Progress
      </div>
      <div className="mt-2 flex flex-1 items-center gap-3">
        <div
          className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full"
          style={{
            background:
              "conic-gradient(var(--accent-violet) 0deg 270deg, color-mix(in oklab, var(--foreground) 10%, transparent) 270deg 360deg)",
          }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-card text-center border border-[var(--accent-violet)]/20 shadow-[0_0_15px_-5px_var(--accent-violet)]">
            <span className="text-[11px] font-bold leading-none text-[var(--accent-violet)] font-mono">
              75%
            </span>
            <span className="text-[7px] font-mono tracking-widest uppercase leading-tight text-muted-foreground mt-0.5">
              Completed
            </span>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />{" "}
            <span>3 Completed</span>
          </li>
          <li className="flex items-center gap-2">
            <PlayCircle className="h-3.5 w-3.5 shrink-0 text-[var(--accent-cyan)] animate-pulse" />{" "}
            <span>1 In Progress</span>
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" /> <span>1 Locked</span>
          </li>
        </ul>
      </div>
    </MagicBentoCard>
  );
}

export function Stat({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-2 text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-foreground font-mono uppercase">
        {icon}
        {value}
      </div>
      <div className="mt-1 text-[9px] font-mono tracking-widest uppercase text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
