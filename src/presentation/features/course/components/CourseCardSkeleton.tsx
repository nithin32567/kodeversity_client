export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card animate-pulse">
      <div className="relative aspect-[16/10] bg-foreground/5" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-4 w-3/4 rounded bg-foreground/10" />
        <div className="h-3 w-1/2 rounded bg-foreground/10" />
        <div className="mt-1 flex gap-3">
          <div className="h-3 w-16 rounded bg-foreground/10" />
          <div className="h-3 w-16 rounded bg-foreground/10" />
        </div>
        <div className="mt-2 h-5 w-1/3 rounded bg-foreground/10" />
        <div className="mt-2 h-9 w-full rounded-lg bg-foreground/10" />
      </div>
    </div>
  );
}
