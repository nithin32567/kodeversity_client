import { useMemo, useState } from "react";
import { redirect } from "@tanstack/react-router";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { MagicBentoSection } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { AppShell } from "@/presentation/global/AppShell";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { useCourses } from "../hooks/useCourses";
import { CourseGridCard } from "./CourseGridCard";
import { CourseCardSkeleton } from "./CourseCardSkeleton";

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

export function AllCoursesPage() {
  const { user, isAuthenticated } = useAuth();
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

  return <AppShell activeTop="Courses">{content}</AppShell>;
}
