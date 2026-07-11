import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  ChevronRight,
  GraduationCap,
  Layers,
  Star,
  Users,
  ExternalLink,
  PenTool,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { instructorService } from "@/infrastructure/instructor/instructorService";
import type { Course } from "@/domain/course";
import { toast } from "sonner";

import { SkeletonCard } from "./components/SkeletonCard";
import { CourseCard } from "./components/CourseCard";
import { CreateCourseModal } from "./components/CreateCourseModal";

export function InstructorCoursesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourses = useCallback(async () => {
    if (isAuthLoading || !user) return;
    setIsLoading(true);
    setIsError(false);
    try {
      let data = await instructorService.getMyCourses();
      if (user.role === "INSTRUCTOR" && user.id) {
        const filtered = data.filter(
          (c) => c.instructorId === user.id || c.instructor?.id === user.id,
        );
        if (filtered.length > 0 || data.length === 0) {
          data = filtered;
        }
      }
      setCourses(data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthLoading, user]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.level && c.level.toLowerCase().includes(q)),
    );
  }, [courses, searchQuery]);

  const handleManage = (slug: string) => {
    navigate(`/instructor/courses/${slug}`);
  };

  if (isAuthLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-purple-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-[var(--hairline)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Instructor portal</span>
            <span>&gt;</span>
            <span className="text-foreground font-medium">My Courses</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-display flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-purple-400" />
            My Courses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your course catalog, build modules, and track student progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCourses}
            disabled={isLoading}
            className="p-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-muted-foreground hover:text-foreground transition disabled:opacity-50 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
            style={{ background: "var(--grad-purple)" }}
          >
            <Plus className="h-4 w-4" />
            Create Course
          </button>
        </div>
      </div>

      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Courses",
              value: courses.length,
              icon: BookOpen,
              color: "text-purple-400",
            },
            {
              label: "Published",
              value: courses.filter((c) => c.isPublished).length,
              icon: ExternalLink,
              color: "text-emerald-400",
            },
            {
              label: "Total Students",
              value: courses.reduce((a, c) => a + (c.enrollmentCount ?? 0), 0),
              icon: Users,
              color: "text-blue-400",
            },
            {
              label: "Avg. Rating",
              value:
                courses.length > 0
                  ? (courses.reduce((a, c) => a + (c.rating ?? 0), 0) / courses.length).toFixed(1)
                  : "—",
              icon: Star,
              color: "text-amber-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface)] flex items-center gap-3"
            >
              <div
                className={`h-10 w-10 rounded-lg grid place-items-center bg-white/[0.04] ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-foreground">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search courses..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center max-w-2xl mx-auto">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-3 animate-pulse" />
          <h3 className="font-semibold text-lg">Unable to load courses</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Please check your connection and try again.
          </p>
          <button
            onClick={fetchCourses}
            className="mt-5 px-5 py-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-sm text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
          <BookOpen className="h-14 w-14 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-xl text-foreground/80">
            {searchQuery ? "No courses match your search" : "No courses yet"}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            {searchQuery
              ? "Try a different search term."
              : "Create your first course to start teaching students. You can add modules, lessons, and quizzes from the Course Builder."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-lg cursor-pointer"
              style={{ background: "var(--grad-purple)" }}
            >
              <Plus className="h-4 w-4" />
              Create Your First Course
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} onManage={handleManage} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            void fetchCourses();
          }}
        />
      )}
    </main>
  );
}
