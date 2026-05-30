import { TrendingUp } from "lucide-react";

type Props = {
  label: string;
  value: string;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  series: number[];
  sparkColor: string;
  sparkColor2: string;
};

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  gradient,
  series,
  sparkColor,
  sparkColor2,
}: Props) {
  const id = `spark-${label.replace(/\s+/g, "-")}`;
  const w = 200;
  const h = 60;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const step = w / (series.length - 1);
  const pts = series.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
    return [x, y] as const;
  });
  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;

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
          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs mt-0.5">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">{delta}</span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="absolute bottom-0 left-0 right-0 w-full h-[60px] opacity-90"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={sparkColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={sparkColor} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-l`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={sparkColor} />
            <stop offset="100%" stopColor={sparkColor2} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${id})`} />
        <path d={linePath} fill="none" stroke={`url(#${id}-l)`} strokeWidth="2" />
      </svg>
    </section>
  );
}
