export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)]/50 animate-pulse space-y-4">
      <div className="h-32 bg-white/[0.04] rounded-xl" />
      <div className="h-5 bg-white/[0.04] rounded w-3/4" />
      <div className="h-3 bg-white/[0.04] rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-7 bg-white/[0.04] rounded-full w-20" />
        <div className="h-7 bg-white/[0.04] rounded-full w-16" />
      </div>
      <div className="h-10 bg-white/[0.04] rounded-xl" />
    </div>
  );
}
