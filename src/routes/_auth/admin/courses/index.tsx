import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, BookOpen, Plus, AlertCircle } from "lucide-react";
import { managementService } from "@/infrastructure/admin/managementService";
import { instructorService } from "@/infrastructure/instructor/instructorService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { Course, Instructor } from "@/domain/course";
import { CourseCard } from "@/presentation/features/admin-courses/components/CourseCard";
import { CreateCourseModal } from "@/presentation/features/admin-courses/components/CreateCourseModal";

export const Route = createFileRoute("/_auth/admin/courses/")({
  head: () => ({ meta: [{ title: "Course Management — Kodeversity" }] }),
  component: AdminCoursesPage,
});

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  BEGINNER_TO_ADVANCED: "All Levels",
};

export function AdminCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [levels, setLevels] = useState<string[]>([
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "BEGINNER_TO_ADVANCED",
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Instructors list compiled from courses
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const fetchCourses = useCallback(() => {
    setIsLoading(true);
    setIsError(false);

    const isInstructor = user?.role === "INSTRUCTOR";
    const coursesPromise = isInstructor
      ? instructorService.getMyCourses()
      : managementService.getCourses();

    const instructorsPromise = isInstructor
      ? Promise.resolve([])
      : managementService.getInstructors();

    Promise.all([coursesPromise, instructorsPromise])
      .then(([courseList, instructorList]) => {
        let finalCourses = courseList;
        if (isInstructor && user?.id) {
          const filtered = courseList.filter(
            (c) => c.instructorId === user.id || c.instructor?.id === user.id,
          );
          if (filtered.length > 0 || courseList.length === 0) {
            finalCourses = filtered;
          }
        }
        setCourses(finalCourses);
        setInstructors(instructorList);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load course management data:", err);
        setIsError(true);
        setIsLoading(false);
      });
  }, [user]);

  useEffect(() => {
    fetchCourses();

    managementService.getLevels().then((res) => {
      if (res && res.length > 0) {
        setLevels(res);
      }
    });
  }, [fetchCourses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel = selectedLevel === "ALL" || c.level === selectedLevel;

      return matchesSearch && matchesLevel;
    });
  }, [courses, searchQuery, selectedLevel]);

  return (
    <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-display">
            Course Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, manage, and configure educational modules and video lessons.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-cta)] text-sm font-semibold text-white px-4 py-2.5 shadow-md shadow-indigo-500/20 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Search and Filters toolbar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--hairline)]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, subtitle, or slug..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
            Filter Level:
          </span>
          {["ALL", ...levels].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                selectedLevel === lvl
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-[var(--surface)] border-[var(--hairline)] text-muted-foreground hover:text-foreground"
              }`}
            >
              {lvl === "ALL" ? "All Levels" : levelLabels[lvl] || lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Courses display grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col h-[400px] rounded-2xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 animate-pulse overflow-hidden"
            >
              <div className="h-[200px] bg-white/[0.04]" />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-6 bg-white/[0.04] rounded w-3/4" />
                  <div className="h-4 bg-white/[0.04] rounded w-1/2" />
                </div>
                <div className="flex gap-4">
                  <div className="h-4 bg-white/[0.04] rounded w-1/4" />
                  <div className="h-4 bg-white/[0.04] rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-3 animate-pulse" />
          <h3 className="font-semibold text-lg">Unable to load courses</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            The course service database may not have seeded successfully, or the connection timed
            out.
          </p>
          <button
            onClick={fetchCourses}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-sm text-foreground hover:bg-[var(--surface)] transition"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="font-semibold text-lg text-foreground/80">No courses match your query</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try resetting your filters or adjusting your search term.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}

      {/* Creation Modal Backdrop & Overlay */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={fetchCourses}
        instructors={instructors}
        levels={levels}
      />
    </main>
  );
}
