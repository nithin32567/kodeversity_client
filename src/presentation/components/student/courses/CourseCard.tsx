import { Clock, Play, ArrowRight, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { slugify, type Course, type Level } from "./data";

const levelBars: Record<Level, number> = {
  Beginner: 1,
  Associate: 2,
  Professional: 3,
};

export function CourseCard({ course }: { course: Course }) {
  const filled = levelBars[course.level];
  const slug = slugify(course.title);

  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)]">
      {course.certificationPrep && (
        <span className="absolute -top-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-[image:var(--gradient-primary)] px-3 py-1 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-primary)]">
          <span className="inline-block h-2 w-2 rounded-full bg-white/90" />
          Certification Prep
        </span>
      )}

      <div className="mb-3 flex items-start justify-between gap-4">
        <Link
          to="/courses/$slug"
          params={{ slug }}
          className="text-lg font-bold leading-tight text-foreground transition-colors hover:text-[var(--accent-cyan)]"
        >
          {course.title}
        </Link>
        <button
          aria-label={`Play preview of ${course.title}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-[var(--accent-cyan)] hover:text-background"
        >
          <Play className="h-4 w-4 fill-current" />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 w-3 rounded-sm ${
                  i < filled ? "bg-[var(--accent-cyan)]" : "bg-secondary"
                }`}
              />
            ))}
          </div>
          <span>{course.level}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>{course.hours} Hours</span>
        </div>
      </div>

      <p className="mb-6 line-clamp-3 text-sm text-muted-foreground">{course.description}</p>

      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-cyan)] text-background">
            <User className="h-4 w-4" />
          </div>
          <span className="text-xs text-foreground">{course.instructor}</span>
        </div>
        <Link
          to="/courses/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-cyan)] hover:underline"
        >
          Details <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}
