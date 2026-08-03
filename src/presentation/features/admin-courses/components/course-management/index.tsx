import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2, Video, FileText, HelpCircle, BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle, ChevronsUpDown, ChevronsDownUp, Upload, TerminalSquare, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { User } from "@/domain/user";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";

import { useCourse } from "@/presentation/features/student-learning/hooks/useCourses";
import { useSuspendCourseMutation, useDeleteCourseMutation } from "@/features/admin/adminApi";
import { useConfirm } from "@/presentation/global/contexts/ConfirmContext";
import { CurriculumPanel } from './components/CurriculumPanel';
import { ConfigPanel } from './components/ConfigPanel';
import { handleModuleReorder, handleChapterReorder } from './utils';
import { LEVEL_OPTIONS } from './utils';
import { AddModuleForm, AddChapterForm } from './types';
export function CourseManagementDashboard({ slug }: { slug: string }) {
  const { data: course, isLoading, isError, refetch } = useCourse(slug);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [localModules, setLocalModules] = useState<Module[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";
  const { confirm } = useConfirm();
  const [suspendCourse] = useSuspendCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const handleSuspend = async () => {
    if (!course) return;
    const isConfirmed = await confirm({
      title: "Suspend Course",
      message: "Are you sure you want to suspend this course?",
      confirmText: "Suspend",
      destructive: true,
    });
    if (isConfirmed) {
      try {
        await suspendCourse({ id: course.id, isSuspended: true }).unwrap();
        toast.success("Course suspended successfully");
        refetch();
      } catch (err) {
        console.error("Failed to suspend course", err);
        toast.error("Failed to suspend course");
      }
    }
  };

  const handleDelete = async () => {
    if (!course) return;
    const isConfirmed = await confirm({
      title: "Delete Course",
      message: "Are you sure you want to delete this course?",
      confirmText: "Delete",
      destructive: true,
    });
    if (isConfirmed) {
      try {
        await deleteCourse(course.id).unwrap();
        toast.success("Course deleted successfully");
        navigate("/admin/courses");
      } catch (err) {
        console.error("Failed to delete course", err);
        toast.error("Failed to delete course");
      }
    }
  };

  useEffect(() => {
    if (course?.modules) setLocalModules(course.modules);
  }, [course]);

  useEffect(() => {
    managementService.getInstructors().then(setInstructors).catch(console.error);
    managementService.getStudents().then(setStudents).catch(console.error);
  }, []);

  const handleAddModule = useCallback(
    async (form: AddModuleForm) => {
      if (!form.title.trim() || !course?.id) return;
      try {
        const newModule = await managementService.createModule(
          course.id,
          form.title.trim(),
          form.description,
        );
        const moduleWithChapters = { ...newModule, chapters: [] };
        setLocalModules((prev) => {
          const updated = [...prev, moduleWithChapters].sort((a, b) => a.sortOrder - b.sortOrder);
          return updated;
        });
      } catch (err) {
        console.error("Failed to create module:", err);
      }
    },
    [course?.id],
  );

  const handleAddChapter = useCallback(async (moduleId: string, form: AddChapterForm) => {
    if (!form.title.trim()) return;
    try {
      const newChapter = await managementService.createChapter(moduleId, {
        title: form.title.trim(),
        description: form.description,
        type: form.type,
        isPreview: false,
        videoUrl: form.videoUrl || null,
        duration: form.duration || null,
        documentUrl: form.documentUrl || null,
        quizzes: form.quizzes || null,
        playgroundConfig: form.playgroundConfig || null,
      });
      setLocalModules((prev) =>
        prev.map((mod) => {
          if (mod.id !== moduleId) return mod;
          const currentChapters = mod.chapters ?? [];
          const updatedChapters = [...currentChapters, newChapter].sort(
            (a, b) => a.sortOrder - b.sortOrder,
          );
          return {
            ...mod,
            chapters: updatedChapters,
          };
        }),
      );
    } catch (err) {
      console.error("Failed to create chapter:", err);
    }
  }, []);

  const handleDeleteChapter = useCallback(async (moduleId: string, chapterId: string) => {
    try {
      await managementService.deleteChapter(chapterId);
      setLocalModules((prev) =>
        prev.map((mod) =>
          mod.id !== moduleId
            ? mod
            : { ...mod, chapters: (mod.chapters ?? []).filter((c) => c.id !== chapterId) },
        ),
      );
    } catch (err) {
      console.error("Failed to delete chapter:", err);
    }
  }, []);

  const handleUpdateModuleTitle = useCallback(async (moduleId: string, title: string) => {
    try {
      await managementService.updateModule(moduleId, title);
      setLocalModules((prev) => prev.map((mod) => (mod.id === moduleId ? { ...mod, title } : mod)));
    } catch (err) {
      console.error("Failed to update module title:", err);
    }
  }, []);

  const handleUpdateChapter = useCallback(
    async (moduleId: string, chapterId: string, form: AddChapterForm) => {
      try {
        const updated = await managementService.updateChapter(chapterId, {
          title: form.title.trim(),
          description: form.description,
          type: form.type,
          videoUrl: form.type === "VIDEO" ? form.videoUrl : null,
          duration: form.type === "VIDEO" ? form.duration : null,
          documentUrl: form.type === "DOCUMENT" ? form.documentUrl : null,
          playgroundConfig: form.type === "PLAYGROUND" ? form.playgroundConfig : null,
        });
        setLocalModules((prev) =>
          prev.map((mod) => {
            if (mod.id !== moduleId) return mod;
            return {
              ...mod,
              chapters: (mod.chapters ?? []).map((ch) => (ch.id === chapterId ? updated : ch)),
            };
          }),
        );
      } catch (err) {
        console.error("Failed to update chapter:", err);
      }
    },
    [],
  );

  const handleReorderModules = useCallback(
    async (fromIdx: number, toIdx: number) => {
      if (!course?.id) return;
      const updated = handleModuleReorder(localModules, fromIdx, toIdx);
      setLocalModules(updated);
      try {
        await managementService.reorderModules(
          course.id,
          updated.map((m) => ({ id: m.id, sortOrder: m.sortOrder })),
        );
      } catch (err) {
        console.error("Failed to reorder modules:", err);
      }
    },
    [course?.id, localModules],
  );

  const handleReorderChapters = useCallback(
    async (moduleId: string, fromIdx: number, toIdx: number) => {
      let updatedChapters: Chapter[] = [];
      setLocalModules((prev) =>
        prev.map((mod) => {
          if (mod.id !== moduleId) return mod;
          updatedChapters = handleChapterReorder(mod.chapters ?? [], fromIdx, toIdx);
          return { ...mod, chapters: updatedChapters };
        }),
      );

      if (updatedChapters.length > 0) {
        try {
          await managementService.reorderChapters(
            moduleId,
            updatedChapters.map((c) => ({ id: c.id, sortOrder: c.sortOrder })),
          );
        } catch (err) {
          console.error("Failed to reorder chapters:", err);
        }
      }
    },
    [],
  );

  const handleSaveAll = useCallback(async () => {
    setSaveStatus("saving");
    try {
      await refetch();
      setSaveStatus("saved");
    } catch (err) {
      console.error(err);
      setSaveStatus("idle");
    } finally {
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  }, [refetch]);

  const handleSaveInstructor = useCallback(
    async (instructorId: string | null) => {
      if (!course?.id) return;
      await managementService.assignInstructor(course.id, instructorId);
      refetch();
    },
    [course?.id, refetch],
  );

  if (isLoading) {
    return (
      <main className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded-lg bg-foreground/10" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-96 rounded-xl bg-foreground/10" />
            <div className="lg:col-span-5 h-96 rounded-xl bg-foreground/10" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !course) {
    return (
      <main className="flex-1 px-6 py-6 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="font-display font-bold text-lg text-foreground">Course not found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The course with slug "{slug}" could not be loaded.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 pb-8 sm:px-6 lg:px-8 overflow-y-auto">
      {}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight md:text-3xl">
            {course.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Course Management Dashboard</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to={
              isAdmin
                ? `/admin/courses/view/${course.slug}`
                : `/instructor/courses/view/${course.slug}`
            }
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)] px-5 py-2.5 text-sm font-bold text-foreground hover:bg-[var(--surface)] active:scale-[0.98] transition shrink-0 cursor-pointer"
          >
            <PlayCircle className="h-4 w-4" /> Preview Course
          </Link>

          {isAdmin && (
            <>
              <button
                onClick={handleSuspend}
                className="inline-flex items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/5 px-5 py-2.5 text-sm font-bold text-orange-400 hover:bg-orange-500/10 active:scale-[0.98] transition shrink-0 cursor-pointer"
              >
                Suspend Course
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 active:scale-[0.98] transition shrink-0 cursor-pointer"
              >
                Delete Course
              </button>
            </>
          )}
          <button
            onClick={handleSaveAll}
            disabled={saveStatus === "saving"}
            className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-primary)] hover:opacity-90 active:scale-[0.98] transition disabled:opacity-60 shrink-0 cursor-pointer"
          >
            {saveStatus === "saving" ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin animate-infinite" />
                Saving…
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="h-4 w-4" /> Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save All Changes
              </>
            )}
          </button>
        </div>
      </div>

      {}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Modules", value: localModules.length },
          {
            label: "Chapters",
            value: localModules.reduce((s, m) => s + (m.chapters?.length ?? 0), 0),
          },
          { label: "Students", value: course.totalStudents },
          {
            label: "Level",
            value: LEVEL_OPTIONS.find((l) => l.value === course.level)?.label ?? course.level,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--hairline)] bg-card px-4 py-3 flex flex-col gap-0.5"
          >
            <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
            <span className="text-lg font-bold text-foreground font-display num">{stat.value}</span>
          </div>
        ))}
      </div>

      {}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {}
        <div className="lg:col-span-7">
          <CurriculumPanel
            modules={localModules}
            onAddModule={handleAddModule}
            onAddChapter={handleAddChapter}
            onUpdateChapter={handleUpdateChapter}
            onDeleteChapter={handleDeleteChapter}
            onUpdateModuleTitle={handleUpdateModuleTitle}
            onReorderModules={handleReorderModules}
            onReorderChapters={handleReorderChapters}
          />
        </div>

        {}
        <div className="lg:col-span-5">
          <ConfigPanel
            course={course}
            instructors={instructors}
            students={students}
            onSaveInstructor={handleSaveInstructor}
            refetchCourse={refetch}
          />
        </div>
      </div>
    </main>
  );
}
