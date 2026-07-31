import React, { useState } from "react";
import { Layers, X, ChevronDown } from "lucide-react";
import type { Course } from "@/domain/course";

interface CreateBatchModalProps {
  onClose: () => void;
  courses: Course[];
  onSubmit: (data: {
    name: string;
    code: string;
    startDate: string;
    courseId: string;
  }) => Promise<void>;
}

export function CreateBatchModal({ onClose, courses, onSubmit }: CreateBatchModalProps) {
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formCourseId, setFormCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formName,
        code: formCode,
        startDate: formStartDate,
        courseId: formCourseId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-2xl space-y-5 animate-scale-in">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground font-display flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-400" />
              Create New Batch
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Fill in the cohort parameters to initialize the batch mapping.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-muted-foreground hover:text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Batch Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., Fullstack Web June Cohort"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 transition text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Unique Batch Code *</label>
            <input
              type="text"
              required
              placeholder="e.g., FS-WEB-JUN-2026"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 transition text-foreground font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Start Date *</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Select Course
              <span className="ml-1 text-muted-foreground/50 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <select
                value={formCourseId}
                onChange={(e) => setFormCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground appearance-none cursor-pointer"
              >
                <option value="">None / General Study Batch</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
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
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Creating..." : "Save Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
