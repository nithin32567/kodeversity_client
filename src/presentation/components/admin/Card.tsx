import { ChevronDown } from "lucide-react";

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg bg-[var(--surface)] border border-[var(--hairline)] p-4 sm:p-5 ${className}`}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {title && <h3 className="text-[15px] font-semibold leading-tight">{title}</h3>}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function MonthPill({ label = "This Month" }: { label?: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[var(--surface-2)] border border-[var(--hairline)] text-xs text-foreground/80 whitespace-nowrap">
      {label}
      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
    </button>
  );
}
