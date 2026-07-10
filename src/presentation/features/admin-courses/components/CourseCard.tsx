import type { Course } from "@/domain/course";
import { Clock, BookOpen, Award, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { useSuspendCourseMutation, useDeleteCourseMutation } from "@/features/admin/adminApi";
import { toast } from "sonner";

interface CourseCardProps {
  course: Course;
  onActionSuccess?: () => void;
}

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  BEGINNER_TO_ADVANCED: "All Levels",
};

function formatDuration(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  return hours > 0 ? `${hours} hr${hours > 1 ? "s" : ""}` : "<1 hr";
}

function formatPrice(price: number, currency: string): string {
  if (currency === "INR") return `₹${price.toLocaleString("en-IN")}`;
  return `$${price.toFixed(2)}`;
}

export function CourseCard({ course, onActionSuccess }: CourseCardProps) {
  const hasDiscount = course.discountPrice !== null && course.discountPrice !== undefined;
  const priceVal = formatPrice(course.price, course.currency);
  const discountVal = hasDiscount ? formatPrice(course.discountPrice!, course.currency) : null;
  const initials = course.instructor?.name
    ? course.instructor.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : "IN";

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [suspendCourse] = useSuspendCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const handleSuspend = async () => {
    if (confirm("Are you sure you want to suspend this course?")) {
      try {
        await suspendCourse({ id: course.id, isSuspended: true }).unwrap();
        toast.success("Course suspended successfully");
        onActionSuccess?.();
      } catch (err) {
        console.error("Failed to suspend course", err);
        toast.error("Failed to suspend course");
      }
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(course.id).unwrap();
        toast.success("Course deleted successfully");
        onActionSuccess?.();
      } catch (err) {
        console.error("Failed to delete course", err);
        toast.error("Failed to delete course");
      }
    }
  };

  return (
    <div className="group flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)]/80 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition duration-350 overflow-hidden">
      {}
      <div className="relative aspect-[16/10] bg-[var(--surface-2)] border-b border-[var(--hairline)] grid place-items-center overflow-hidden">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-950/20 to-slate-900 grid place-items-center">
            <Layers className="h-10 w-10 text-indigo-400 opacity-60" />
          </div>
        )}

        {}
        <span className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider bg-black/60 backdrop-blur-sm text-indigo-300 ring-1 ring-white/10 uppercase">
          {levelLabels[course.level] || course.level}
        </span>

        {}
        <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-sm text-slate-300 ring-1 ring-white/10">
          <Clock className="h-3 w-3" />
          {formatDuration(course.totalDuration)}
        </span>
      </div>

      {}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-indigo-400 transition">
            {course.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {course.subtitle || course.description}
          </p>
        </div>

        {}
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-[var(--hairline)] pt-3">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{course.lessonsCount} lessons</span>
          </div>
          {course.hasCertificate && (
            <div className="flex items-center gap-1 text-emerald-400">
              <Award className="h-3.5 w-3.5" />
              <span>Certificate</span>
            </div>
          )}
        </div>

        {}
        <div className="flex items-center justify-between border-t border-[var(--hairline)] pt-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-semibold grid place-items-center">
              {initials}
            </div>
            <div className="text-[11px]">
              <p className="font-medium text-foreground/80 leading-none">
                {course.instructor?.name ?? "Guest Instructor"}
              </p>
              <p className="text-muted-foreground/60 leading-none text-[9px] mt-0.5">
                {course.instructor?.designation ?? "Instructor"}
              </p>
            </div>
          </div>

          <div className="text-right">
            {hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground line-through">{priceVal}</span>
                <span className="font-bold text-md text-foreground">{discountVal}</span>
              </div>
            ) : (
              <span className="font-bold text-md text-foreground">{priceVal}</span>
            )}
          </div>
        </div>

        {}
        <div className="pt-3 mt-1 border-t border-[var(--hairline)] flex flex-col gap-2">
          <Link
            to={`/admin/courses/view/${course.slug}`}
            className="flex w-full items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-primary)] transition-transform hover:scale-[1.02]"
          >
            Preview Course Contents
          </Link>
          <Link
            to={`/admin/courses/${course.slug}`}
            className="flex w-full items-center justify-center rounded-lg border border-[var(--hairline)] bg-transparent py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
          >
            ⚙ Manage Course
          </Link>
          {isAdmin && (
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={handleSuspend}
                className="flex-1 py-1.5 rounded-lg border border-orange-500/30 text-orange-400 text-xs font-medium hover:bg-orange-500/10 transition"
              >
                Suspend
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
