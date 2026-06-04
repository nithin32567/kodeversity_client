import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { AppShell } from "@/presentation/global/AppShell";
import { StudentLayout } from "@/presentation/global/layouts/StudentLayout";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { useCourses } from "@/presentation/features/student-learning/hooks/useCourses";
import type { Course } from "@/domain/course";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "All Courses — Kodeversity" },
      {
        name: "description",
        content: "Choose from 200+ industry-focused courses and start your learning journey.",
      },
    ],
  }),
  component: AllCoursesPage,
});

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

function computeAverageRating(reviews: Course["reviews"]): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

function formatDuration(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  return hours > 0 ? `${hours}` : "<1";
}

function formatPrice(price: number, currency: string): string {
  if (currency === "INR") return `₹${price.toLocaleString("en-IN")}`;
  return `$${price.toFixed(2)}`;
}

function AllCoursesPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All Courses");
  const [query, setQuery] = useState("");
  const glow = useAccentRgb();
  const { data: courses, isLoading, isError } = useCourses();

  const isStudent = isAuthenticated && user?.role === "STUDENT";

  const filtered = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c) => {
      const matchQ = !query || c.title.toLowerCase().includes(query.toLowerCase());
      return matchQ;
    });
  }, [courses, query]);

  const content = (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <h1 className="font-display text-3xl font-bold md:text-4xl">All Courses</h1>

      <p className="mt-2 text-sm text-muted-foreground md:text-base">
        Choose from industry-focused courses and start your learning journey
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, topics or skills..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:bg-foreground/[0.04]">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => {
          const active = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-primary)]"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          );
        })}
        <button className="shrink-0 rounded-lg border border-border bg-card px-2 py-2 text-muted-foreground hover:text-foreground">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {isLoading ? "Loading courses…" : `Showing ${filtered.length} courses`}
        </span>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
          Sort by: <span className="font-medium text-foreground">Popular</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {isError && (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
          <AlertCircle className="h-10 w-10 text-rose-400" />
          <p className="text-sm font-medium text-foreground">Unable to load courses</p>
          <p className="text-xs text-muted-foreground">
            Check your connection or try refreshing the page.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && !isError && (
        <MagicBentoSection
          className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          glowColor={glow}
          spotlightRadius={400}
        >
          {filtered.map((course, i) => (
            <CourseGridCard key={course.id} course={course} index={i} />
          ))}
        </MagicBentoSection>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <p className="text-base font-semibold text-foreground">No courses found</p>
          <p className="text-sm text-muted-foreground">Try a different search term.</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {[1].map((n) => (
            <button
              key={n}
              className="h-9 min-w-9 rounded-md bg-[image:var(--gradient-primary)] px-3 text-sm font-medium text-primary-foreground"
            >
              {n}
            </button>
          ))}
          <button className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );

  if (isStudent) {
    return <StudentLayout>{content}</StudentLayout>;
  }

  return <AppShell activeTop="Courses">{content}</AppShell>;
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
        <div className="mt-2 h-9 w-full rounded-lg bg-foreground/10" />
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
  const hours = formatDuration(course.totalDuration);
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
          params={{ slug: course.slug }}
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
            <Clock className="h-3 w-3" /> {hours} Hours
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
          params={{ slug: course.slug }}
          className="mt-4 block w-full rounded-lg bg-[image:var(--gradient-primary)] py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-[var(--shadow-primary)] transition-transform hover:scale-[1.01]"
        >
          View Course
        </Link>
      </div>
    </MagicBentoCard>
  );
}
