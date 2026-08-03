import { TrendingUp } from "lucide-react";

type Props = {
  label: string;
  value: string;
  delta?: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
};

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  gradient,
}: Props) {

  return (
    <section className="relative min-h-[148px] rounded-lg bg-[var(--surface)] border border-[var(--hairline)] p-4 overflow-hidden">
      <div className="flex items-start gap-3">
        <div
          className="h-11 w-11 shrink-0 rounded-lg grid place-items-center text-white shadow-lg"
          style={{ background: gradient }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 relative z-10">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-[24px] sm:text-[26px] font-bold leading-tight num mt-0.5 whitespace-nowrap">
            {value}
          </div>
          {delta && (
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs mt-0.5">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">{delta}</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
