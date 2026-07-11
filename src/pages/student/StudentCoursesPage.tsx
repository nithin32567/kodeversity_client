import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { useCourses } from "@/presentation/features/student-learning/hooks/useCourses";
import type { Course } from "@/domain/course";

const categories = [
  "All Courses",
  "Web Development",
  "AI & ML",
  "DevOps",
  "Cloud Computing",
  "Cyber Security",
  "Mobile Development",
  "UI/UX Design",
];

const palette = [
  { accent: "from-[var(--accent-cyan)]/40 to-[var(--accent-cyan)]/10", icon: "⚛" },
  { accent: "from-[var(--accent-violet)]/35 to-[var(--accent-cyan)]/20", icon: "JS" },
  { accent: "from-[var(--accent-cyan)]/40 to-[var(--accent-cyan)]/5", icon: "AWS" },
  { accent: "from-[var(--accent-violet)]/30 to-[var(--accent-cyan)]/20", icon: "🐍" },
  { accent: "from-[var(--accent-cyan)]/40 to-[var(--accent-violet)]/30", icon: "∞" },
  { accent: "from-[var(--accent-cyan)]/40 to-[var(--accent-cyan)]/10", icon: "F" },
  { accent: "from-[var(--accent-violet)]/35 to-[var(--accent-cyan)]/15", icon: "💧" },
  { accent: "from-[var(--accent-cyan)]/40 to-[var(--accent-violet)]/20", icon: "🛡" },
  { accent: "from-[var(--accent-cyan)]/40 to-[var(--accent-cyan)]/10", icon: "🍃" },
];

const badgeCycle: ("BESTSELLER" | "POPULAR" | "TRENDING" | undefined)[] = [
  "BESTSELLER",
  "POPULAR",
  "BESTSELLER",
  "TRENDING",
  undefined,
  undefined,
];

function computeAverageRating(reviews: Course["reviews"]): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return "0 mins";
  if (seconds < 3600) {
    const mins = Math.round(seconds / 60);
    return `${mins} mins`;
  }
  const hours = (seconds / 3600).toFixed(2);
  const cleanHours = parseFloat(hours);
  return `${cleanHours} hrs`;
}

function formatPrice(price: number, currency: string): string {
  if (currency === "INR") return `₹${price.toLocaleString("en-IN")}`;
  return `$${price.toFixed(2)}`;
}

export function StudentCoursesPage() {
  const [activeCategory, setActiveCategory] = useState("All Courses");
  const [query, setQuery] = useState("");
  const glow = useAccentRgb();
  const { data: courses, isLoading, isError } = useCourses();

  const filtered = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c) => {
      const matchQ = !query || c.title.toLowerCase().includes(query.toLowerCase());
      return matchQ;
    });
  }, [courses, query]);

  return (
    <main className="relative flex-1 w-full overflow-hidden bg-background py-8 md:py-12">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-[var(--accent-cyan)]" />
              ALL COURSES
            </h1>
            <p className="text-xs text-muted-foreground mt-2 font-mono uppercase tracking-widest">
              Choose from industry-focused courses and enroll to upgrade your skills.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, topics or skills..."
              className="w-full rounded-full border border-border bg-card/60 py-3 pl-11 pr-4 text-[11px] font-mono uppercase tracking-wider text-foreground placeholder:text-muted-foreground focus:border-[var(--accent-cyan)] focus:outline-none transition-colors"
            />
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.02] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/90 transition-colors hover:border-[var(--accent-cyan)]/40 hover:text-[var(--accent-cyan)]">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all ${
                  active
                    ? "bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] text-background shadow-[0_0_15px_var(--accent-cyan)]"
                    : "border border-foreground/15 bg-foreground/[0.02] text-muted-foreground hover:border-[var(--accent-cyan)]/40 hover:text-[var(--accent-cyan)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
          <button className="shrink-0 rounded-full border border-foreground/15 bg-foreground/[0.02] px-3 py-2 text-muted-foreground hover:border-[var(--accent-cyan)]/40 hover:text-[var(--accent-cyan)] transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {isLoading ? "Loading courses…" : `Showing ${filtered.length} courses`}
          </span>
          <button className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.02] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors hover:border-[var(--accent-cyan)]/40 hover:text-[var(--accent-cyan)]">
            Sort by: <span className="font-bold">Popular</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {isError && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
            <AlertCircle className="h-10 w-10 text-rose-400" />
            <p className="text-sm font-medium text-foreground">Unable to load courses</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Check your connection or try refreshing the page.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <MagicBentoSection
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            glowColor={glow}
            spotlightRadius={400}
          >
            {filtered.map((course, i) => (
              <CourseGridCard key={course.id} course={course} index={i} />
            ))}
          </MagicBentoSection>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 text-center py-10">
            <p className="text-base font-bold text-foreground font-mono uppercase tracking-tight">No courses found</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Try a different search term.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function CourseCardSkeleton() {
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
        <div className="mt-2 h-10 w-full rounded-full bg-foreground/10" />
      </div>
    </div>
  );
}

function CourseGridCard({ course, index }: { course: Course; index: number }) {
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
  const hours = formatDuration(accurateDuration);
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

  const levelLabel: Record<string, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    BEGINNER_TO_ADVANCED: "Beginner to Advanced",
  };

  const accurateLessonsCount = course.modules
    ? course.modules.reduce((acc, module) => acc + (module.chapters?.length || 0), 0)
    : course.lessonsCount || 0;

  return (
    <MagicBentoCard
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)]"
      glowColor={glow}
      particleCount={10}
      enableTilt
    >
      <div
        className="relative grid aspect-[16/10] place-items-center overflow-hidden bg-gradient-to-br from-[var(--accent-cyan)]/5 to-[var(--accent-violet)]/5"
      >
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
            backgroundSize: "12px 12px",
          }}
        />
        {badge && (
          <span
            className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase border ${
              badge === "POPULAR"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : badge === "TRENDING"
                  ? "bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] border-[var(--accent-violet)]/40"
                  : "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/40"
            }`}
          >
            {badge}
          </span>
        )}
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 mix-blend-luminosity group-hover:mix-blend-normal"
          />
        ) : (
          <div
            className={`grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${palette_item.accent} text-2xl font-bold text-foreground border border-white/10`}
          >
            {palette_item.icon}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link
          to={`/student/courses/${course.slug}`}
          className="line-clamp-2 min-h-[2.75rem] text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-[var(--accent-cyan)]"
        >
          {course.title}
        </Link>

        <div className="mt-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-violet)]/20 text-[9px] font-bold border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)]">
              {initials}
            </div>
            <span className="text-muted-foreground truncate max-w-[100px]">{instructorName}</span>
          </div>
          {avgRating > 0 && (
            <div className="flex items-center gap-1 text-[var(--accent-cyan)]">
              <Star className="h-3 w-3 fill-current" />
              <span className="font-bold text-foreground">{avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3 text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-[var(--accent-violet)]" /> {hours} Hours
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3 w-3 text-[var(--accent-cyan)]" /> {accurateLessonsCount} Lessons
          </span>
        </div>

        <div className="mt-5 flex items-baseline gap-2">
          <span className="font-mono text-xl font-bold text-foreground">{price}</span>
          {originalPrice && (
            <>
              <span className="text-xs text-muted-foreground line-through font-mono">{originalPrice}</span>
              {discountPct && (
                <span className="text-[10px] font-bold text-[var(--accent-cyan)] font-mono uppercase tracking-widest bg-[var(--accent-cyan)]/10 px-1.5 py-0.5 rounded ml-1">{discountPct}% OFF</span>
              )}
            </>
          )}
        </div>

        <Link
          to={`/student/courses/${course.slug}`}
          className="group/btn mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_var(--accent-cyan)]"
        >
          <span>View Course</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </MagicBentoCard>
  );
}
