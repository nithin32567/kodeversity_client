import { BookOpen, Users, Layers, Star, PenTool, ChevronRight, Clock } from "lucide-react";
import type { Course } from "@/domain/course";

function levelBadge(level?: string) {
  const map: Record<string, string> = {
    BEGINNER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    INTERMEDIATE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ADVANCED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    BEGINNER_TO_ADVANCED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${map[level ?? ""] ?? "bg-white/[0.04] text-muted-foreground border-[var(--hairline)]"}`}
    >
      {level?.replace(/_/g, " ") ?? "All Levels"}
    </span>
  );
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds === 0) return "0 mins";
  if (seconds < 3600) {
    const mins = Math.round(seconds / 60);
    return `${mins} mins`;
  }
  const hours = (seconds / 3600).toFixed(2);
  const cleanHours = parseFloat(hours);
  return `${cleanHours} hrs`;
}

export function CourseCard({
  course,
  onManage,
}: {
  course: Course;
  onManage: (slug: string) => void;
}) {
  let accurateDuration = course.modules?.reduce(
    (acc, mod) =>
      acc +
      (mod.chapters?.reduce((cAcc, ch) => cAcc + (ch.durationInSeconds || ch.duration || 0), 0) ||
        0),
    0,
  );
  if (!accurateDuration || accurateDuration === 0) {
    accurateDuration = course.totalDuration || 0;
  }

  return (
    <div className="group flex flex-col p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/50 hover:border-white/[0.1] transition-all duration-300 shadow-lg relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "var(--grad-purple)" }}
      />

      <div className="relative w-full h-32 mb-4 rounded-xl overflow-hidden border border-[var(--hairline)]">
        {course.coverImageUrl || course.thumbnailUrl ? (
          <img
            src={course.coverImageUrl || course.thumbnailUrl || ""}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div
            className="w-full h-full grid place-items-center"
            style={{ background: "var(--grad-purple)", opacity: 0.15 }}
          >
            <BookOpen className="h-10 w-10 text-white opacity-60" />
          </div>
        )}
        <span className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-sm text-slate-300 ring-1 ring-white/10">
          <Clock className="h-3 w-3" />
          {formatDuration(accurateDuration)}
        </span>
      </div>

      <h3 className="font-semibold text-[16px] text-foreground group-hover:text-purple-400 transition line-clamp-2 mb-1">
        {course.title}
      </h3>
      {course.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {levelBadge(course.level)}
        {course.price !== undefined && course.price !== null && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.04] text-muted-foreground border border-[var(--hairline)]">
            ₹{course.price?.toLocaleString("en-IN")}
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.04] text-muted-foreground border border-[var(--hairline)]">
          <Star className="h-2.5 w-2.5" />
          {course.rating?.toFixed(1) ?? "N/A"}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 border-t border-[var(--hairline)] pt-3 mt-auto">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-indigo-400" />
          {course.enrollmentCount ?? 0} enrolled
        </span>
        <span className="flex items-center gap-1">
          <Layers className="h-3.5 w-3.5 text-blue-400" />
          {course.modules?.length ?? 0} modules
        </span>
      </div>

      <button
        onClick={() => onManage(course.slug ?? course.id)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition active:scale-[0.98] cursor-pointer shadow-lg"
        style={{ background: "var(--grad-purple)" }}
      >
        <PenTool className="h-4 w-4" />
        Manage Content
        <ChevronRight className="h-4 w-4 ml-auto opacity-75" />
      </button>
    </div>
  );
}
