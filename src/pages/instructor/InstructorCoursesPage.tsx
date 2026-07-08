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

function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)]/50 animate-pulse space-y-4">
      <div className="h-32 bg-white/[0.04] rounded-xl" />
      <div className="h-5 bg-white/[0.04] rounded w-3/4" />
      <div className="h-3 bg-white/[0.04] rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-7 bg-white/[0.04] rounded-full w-20" />
        <div className="h-7 bg-white/[0.04] rounded-full w-16" />
      </div>
      <div className="h-10 bg-white/[0.04] rounded-xl" />
    </div>
  );
}

function CourseCard({ course, onManage }: { course: Course; onManage: (slug: string) => void }) {
  return (
    <div className="group flex flex-col p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/50 hover:border-white/[0.1] transition-all duration-300 shadow-lg relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "var(--grad-purple)" }}
      />

      {course.coverImageUrl ? (
        <img
          src={course.coverImageUrl}
          alt={course.title}
          className="w-full h-32 object-cover rounded-xl mb-4 border border-[var(--hairline)]"
        />
      ) : (
        <div
          className="w-full h-32 rounded-xl mb-4 grid place-items-center border border-[var(--hairline)]"
          style={{ background: "var(--grad-purple)", opacity: 0.15 }}
        >
          <BookOpen className="h-10 w-10 text-white opacity-60" />
        </div>
      )}

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
          {(course.modules ?? []).length} modules
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

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "BEGINNER_TO_ADVANCED"];

function CreateCourseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("BEGINNER");
  const [price, setPrice] = useState<number | "">("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .slice(0, 60),
      );
    }
  }, [title, slugTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and slug are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await instructorService.createCourse({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        level,
        price: price === "" ? undefined : Number(price),
        coverImageUrl: coverImageUrl.trim() || undefined,
      });
      toast.success(`Course "${title}" created successfully!`);
      onCreated();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to create course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-start shrink-0">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Create New Course
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Build a new learning experience for your students.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-muted-foreground hover:text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Course Title *</label>
            <input
              required
              type="text"
              placeholder="e.g., Complete Fullstack Development with React & Node"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500 transition text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              URL Slug *{" "}
              <span className="text-muted-foreground/50 font-normal">(auto-generated)</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g., complete-fullstack-react-node"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500 transition text-foreground font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <textarea
              placeholder="Brief overview of what students will learn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500 transition text-foreground resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Difficulty Level
              </label>
              <div className="relative">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-purple-500 transition text-foreground appearance-none cursor-pointer"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Price (₹)</label>
              <input
                type="number"
                min={0}
                placeholder="0 for free"
                value={price}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500 transition text-foreground font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Cover Image URL{" "}
              <span className="text-muted-foreground/50 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500 transition text-foreground"
            />
          </div>

          <div className="flex gap-3 pt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-sm font-semibold text-foreground hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: "var(--grad-purple)" }}
            >
              {isSubmitting ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
