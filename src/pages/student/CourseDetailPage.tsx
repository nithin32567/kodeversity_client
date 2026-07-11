export function CourseDetailPage() {
  return (
    <main className="relative flex-1 w-full overflow-hidden bg-background py-8 md:py-12 flex items-center justify-center min-h-[400px]">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 w-full flex justify-center">
        <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-10 max-w-md w-full transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)] text-center space-y-6">
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
              backgroundSize: "12px 12px",
            }}
          />
          <div className="space-y-4 relative z-10">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-[var(--accent-cyan)]">
              <span className="size-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
              Under Development
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-mono uppercase">
              Course Detail
            </h2>
            <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground leading-relaxed">
              use useGetCourseBySlugQuery
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
