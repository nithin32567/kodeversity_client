import { Link } from "react-router-dom";
import { Star, Clock, BookOpen } from "lucide-react";
import { MagicBentoCard } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import type { Course } from "../types";
import { computeAverageRating, formatDurationShort, formatPrice, levelLabel } from "./utils";

const palette = [
  { accent: "from-primary/40 to-primary/10", icon: "⚛" },
  { accent: "from-primary/35 to-primary-deep/20", icon: "JS" },
  { accent: "from-primary/40 to-primary/5", icon: "AWS" },
  { accent: "from-primary-glow/30 to-primary/20", icon: "🐍" },
  { accent: "from-primary/40 to-primary-deep/30", icon: "∞" },
  { accent: "from-primary/40 to-primary/10", icon: "F" },
  { accent: "from-primary/35 to-primary/15", icon: "💧" },
  { accent: "from-primary/40 to-primary-deep/20", icon: "🛡" },
  { accent: "from-primary/40 to-primary/10", icon: "🍃" },
];

const badgeCycle: ("BESTSELLER" | "POPULAR" | "TRENDING" | undefined)[] = [
  "BESTSELLER",
  "POPULAR",
  "BESTSELLER",
  "TRENDING",
  undefined,
  undefined,
];

interface CourseGridCardProps {
  course: Course;
  index: number;
}

export function CourseGridCard({ course, index }: CourseGridCardProps) {
  const glow = useAccentRgb();
  const palette_item = palette[index % palette.length];
  const badge = badgeCycle[index % badgeCycle.length];
  const avgRating = computeAverageRating(course.reviews);
  const reviewCount = course.reviews?.length ?? 0;
  let accurateDuration = course.modules?.reduce(
    (acc, mod) => acc + (mod.chapters?.reduce((cAcc, ch) => cAcc + (ch.durationInSeconds || ch.duration || 0), 0) || 0),
    0
  );
  if (!accurateDuration || accurateDuration === 0) {
    accurateDuration = course.totalDuration || 0;
  }
  const hours = formatDurationShort(accurateDuration);
  const price = formatPrice(course.price, course.currency);
  const originalPrice = course.discountPrice
    ? formatPrice(course.discountPrice, course.currency)
    : null;
  const instructorName = course.instructor?.name ?? "Instructor";
  const initials = instructorName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const discountPct =
    course.discountPrice && course.price > course.discountPrice
      ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
      : null;

  return (
    <MagicBentoCard
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
      glowColor={glow}
      particleCount={10}
      enableTilt
    >
      <div
        className="relative grid aspect-[16/10] place-items-center"
        style={{
          background: "radial-gradient(ellipse at center, #1e1b4b 0%, #0b0a1f 75%)",
        }}
      >
        {badge && (
          <span
            className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[10px] font-bold tracking-wider ${
              badge === "POPULAR"
                ? "bg-amber-500/20 text-amber-300"
                : badge === "TRENDING"
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-emerald-500/20 text-emerald-300"
            }`}
          >
            {badge}
          </span>
        )}
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${palette_item.accent} text-2xl font-bold text-foreground ring-2 ring-border`}
          >
            {palette_item.icon}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link
          to="/courses/$slug"
          className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary"
        >
          {course.title}
        </Link>

        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary/40 to-primary/10 text-[10px] font-semibold ring-1 ring-border">
              {initials}
            </div>
            <span className="text-muted-foreground">{instructorName}</span>
          </div>
          {avgRating > 0 && (
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-medium text-foreground">{avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {hours}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> {course.lessonsCount} Lessons
          </span>
          <span>{levelLabel[course.level] ?? course.level}</span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-xl font-bold">{price}</span>
          {originalPrice && (
            <>
              <span className="text-xs text-muted-foreground line-through">{originalPrice}</span>
              {discountPct && (
                <span className="text-xs font-bold text-emerald-400">{discountPct}% OFF</span>
              )}
            </>
          )}
        </div>

        <Link
          to="/courses/$slug"
          className="mt-4 block w-full rounded-lg bg-[image:var(--gradient-primary)] py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-[var(--shadow-primary)] transition-transform hover:scale-[1.01]"
        >
          View Course
        </Link>
      </div>
    </MagicBentoCard>
  );
}
