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
} from "lucide-react";
import { allCourses, slugify, type Course } from "@/presentation/components/courses/data";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/components/ui/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { AppShell } from "@/presentation/components/AppShell";

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

// Augment course list with metadata for cards
type ExtendedCourse = Course & {
  badge?: "BESTSELLER" | "POPULAR" | "TRENDING";
  price: number;
  originalPrice: number;
  rating: number;
  ratings: string;
  lessons: number;
  category: string;
  accent: string;
  icon: string;
};

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

const badges: ExtendedCourse["badge"][] = [
  "BESTSELLER",
  "POPULAR",
  "BESTSELLER",
  "TRENDING",
  undefined,
  undefined,
];

const courses: ExtendedCourse[] = allCourses.map((c, i) => ({
  ...c,
  badge: badges[i % badges.length],
  price: 1299 + (i % 5) * 200,
  originalPrice: 2599 + (i % 5) * 400,
  rating: 4.6 + ((i * 7) % 4) / 10,
  ratings: `${(0.7 + (i % 7) * 0.15).toFixed(1)}K`,
  lessons: 60 + ((i * 17) % 80),
  category: categories[(i % (categories.length - 1)) + 1],
  accent: palette[i % palette.length].accent,
  icon: palette[i % palette.length].icon,
}));

function AllCoursesPage() {
  const [activeCategory, setActiveCategory] = useState("All Courses");
  const [query, setQuery] = useState("");
  const glow = useAccentRgb();

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = activeCategory === "All Courses" || c.category === activeCategory;
      const matchQ = !query || c.title.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [activeCategory, query]);

  return (
    <AppShell activeTop="Courses">
      <div className="px-4 py-8 md:px-8 md:py-10">
        <h1 className="font-display text-3xl font-bold md:text-4xl">All Courses</h1>

        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Choose from 200+ industry-focused courses and start your learning journey
        </p>

        {/* Search + Filters */}
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

        {/* Category pills */}
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

        {/* Showing / Sort */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing 1 to {filtered.length} of 200+ courses
          </span>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
            Sort by: <span className="font-medium text-foreground">Popular</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Grid with MagicBento effects */}
        <MagicBentoSection
          className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          glowColor={glow}
          spotlightRadius={400}
        >
          {filtered.map((c) => (
            <CourseGridCard key={c.title} course={c} />
          ))}
        </MagicBentoSection>

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-center gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              className={`h-9 min-w-9 rounded-md px-3 text-sm font-medium ${
                n === 1
                  ? "bg-[image:var(--gradient-primary)] text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {n}
            </button>
          ))}
          <span className="px-2 text-muted-foreground">...</span>
          <button className="h-9 min-w-9 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground hover:text-foreground">
            17
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function CourseGridCard({ course }: { course: ExtendedCourse }) {
  const slug = slugify(course.title);
  const glow = useAccentRgb();
  return (
    <MagicBentoCard
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
      glowColor={glow}
      particleCount={10}
      enableTilt
    >
      {/* Hero area */}
      <div
        className="relative grid aspect-[16/10] place-items-center"
        style={{
          background: "radial-gradient(ellipse at center, #1e1b4b 0%, #0b0a1f 75%)",
        }}
      >
        {course.badge && (
          <span
            className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[10px] font-bold tracking-wider ${
              course.badge === "POPULAR"
                ? "bg-amber-500/20 text-amber-300"
                : course.badge === "TRENDING"
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-emerald-500/20 text-emerald-300"
            }`}
          >
            {course.badge}
          </span>
        )}
        <div
          className={`grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${course.accent} text-2xl font-bold text-foreground ring-2 ring-border`}
        >
          {course.icon}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <Link
          to="/courses/$slug"
          params={{ slug }}
          className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary"
        >
          {course.title}
        </Link>

        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary/40 to-primary/10 text-[10px] font-semibold ring-1 ring-border">
              {course.instructor
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <span className="text-muted-foreground">{course.instructor}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="font-medium text-foreground">{course.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({course.ratings})</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {course.hours} Hours
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> {course.lessons} Lessons
          </span>
          <span>{course.level}</span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-xl font-bold">
            ₹{course.price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-muted-foreground line-through">
            ₹{course.originalPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-bold text-emerald-400">50% OFF</span>
        </div>

        <Link
          to="/courses/$slug"
          params={{ slug }}
          className="mt-4 block w-full rounded-lg bg-[image:var(--gradient-primary)] py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-[var(--shadow-primary)] transition-transform hover:scale-[1.01]"
        >
          View Course
        </Link>
      </div>
    </MagicBentoCard>
  );
}
