import { useState } from "react";
import { useGetArchivedCoursesQuery, useSuspendCourseMutation, useRestoreCourseMutation } from "@/features/admin/adminApi";
import { Archive, RotateCcw, AlertCircle, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/presentation/global/contexts/ConfirmContext";

export function AdminArchivePage() {
  const { data: courses = [], isLoading, isError, refetch } = useGetArchivedCoursesQuery();
  const [suspendCourse] = useSuspendCourseMutation();
  const [restoreCourse] = useRestoreCourseMutation();
  const [activeTab, setActiveTab] = useState<"suspended" | "deleted">("suspended");
  const { confirm } = useConfirm();

  const suspendedCourses = courses.filter((c: any) => c.isSuspended && !c.isDeleted);
  const deletedCourses = courses.filter((c: any) => c.isDeleted);

  const displayCourses = activeTab === "suspended" ? suspendedCourses : deletedCourses;

  const handleReactivate = async (courseId: string) => {
    if (await confirm("Are you sure you want to reactivate this course?")) {
      try {
        await suspendCourse({ id: courseId, isSuspended: false }).unwrap();
        toast.success("Course reactivated successfully");
      } catch (err) {
        console.error("Failed to reactivate course", err);
        toast.error("Failed to reactivate course");
      }
    }
  };

  const handleRestore = async (courseId: string) => {
    if (await confirm("Are you sure you want to restore this deleted course?")) {
      try {
        await restoreCourse(courseId).unwrap();
        toast.success("Course restored successfully");
      } catch (err) {
        console.error("Failed to restore course", err);
        toast.error("Failed to restore course");
      }
    }
  };

  return (
    <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-display flex items-center gap-2">
            <Archive className="h-6 w-6 text-indigo-500" /> Archived Content
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage suspended and soft-deleted courses.
          </p>
        </div>
      </div>

      <div className="flex space-x-1 rounded-xl bg-[var(--surface-2)]/40 p-1 border border-[var(--hairline)] max-w-sm">
        <button
          onClick={() => setActiveTab("suspended")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === "suspended"
              ? "bg-indigo-500/10 text-indigo-400 shadow"
              : "text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground"
          }`}
        >
          Suspended ({suspendedCourses.length})
        </button>
        <button
          onClick={() => setActiveTab("deleted")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === "deleted"
              ? "bg-red-500/10 text-red-400 shadow"
              : "text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground"
          }`}
        >
          Deleted ({deletedCourses.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-3 animate-pulse" />
          <h3 className="font-semibold text-lg">Unable to load archived courses</h3>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-sm text-foreground hover:bg-[var(--surface)] transition"
          >
            Retry
          </button>
        </div>
      ) : displayCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
          <Archive className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="font-semibold text-lg text-foreground/80">No {activeTab} courses</h3>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayCourses.map((course: any) => (
            <div
              key={course.id}
              className="flex items-center justify-between p-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)]/80 transition"
            >
              <div>
                <h3 className="font-semibold text-lg">{course.title}</h3>
                <p className="text-sm text-muted-foreground">{course.slug}</p>
                {course.deletedAt && (
                  <p className="text-xs text-red-400 mt-1">
                    Deleted on: {new Date(course.deletedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                {activeTab === "suspended" && (
                  <button
                    onClick={() => handleReactivate(course.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-medium hover:bg-indigo-500/20 transition"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reactivate
                  </button>
                )}
                {activeTab === "deleted" && (
                  <>
                    <span className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 text-xs font-semibold flex items-center">
                      Soft Deleted
                    </span>
                    <button
                      onClick={() => handleRestore(course.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium hover:bg-emerald-500/20 transition"
                    >
                      <Undo2 className="h-4 w-4" />
                      Restore
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
