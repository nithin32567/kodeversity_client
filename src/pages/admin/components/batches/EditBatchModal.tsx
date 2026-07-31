import React, { useState } from "react";
import { Edit2, X, ChevronDown } from "lucide-react";
import type { Batch } from "@/infrastructure/admin/managementService";
import type { Course } from "@/domain/course";

interface EditBatchModalProps {
  onClose: () => void;
  batch: Batch;
  courses: Course[];
  onSubmit: (data: {
    id: string;
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    courseId: string;
    status: Batch["status"];
  }) => Promise<void>;
}

export function EditBatchModal({ onClose, batch, courses, onSubmit }: EditBatchModalProps) {
  const [editFormName, setEditFormName] = useState(batch.name);
  const [editFormCode, setEditFormCode] = useState(batch.code);
  const [editFormStartDate, setEditFormStartDate] = useState(
    new Date(batch.startDate).toISOString().split("T")[0]
  );
  const [editFormEndDate, setEditFormEndDate] = useState(
    batch.endDate ? new Date(batch.endDate).toISOString().split("T")[0] : ""
  );
  const [editFormCourseId, setEditFormCourseId] = useState(batch.courseId || "");
  const [editFormStatus, setEditFormStatus] = useState<Batch["status"]>(batch.status);
  const [isUpdatingBatch, setIsUpdatingBatch] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingBatch(true);
    try {
      await onSubmit({
        id: batch.id,
        name: editFormName,
        code: editFormCode,
        startDate: editFormStartDate,
        endDate: editFormEndDate,
        courseId: editFormCourseId,
        status: editFormStatus,
      });
    } finally {
      setIsUpdatingBatch(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-2xl space-y-5 animate-scale-in">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground font-display flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-blue-400" />
              Edit Batch
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Update the batch details and settings.
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
              value={editFormName}
              onChange={(e) => setEditFormName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 transition text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Unique Batch Code *</label>
            <input
              type="text"
              required
              placeholder="e.g., FS-WEB-JUN-2026"
              value={editFormCode}
              onChange={(e) => setEditFormCode(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 transition text-foreground font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Start Date *</label>
            <input
              type="date"
              required
              value={editFormStartDate}
              onChange={(e) => setEditFormStartDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">End Date</label>
            <input
              type="date"
              value={editFormEndDate}
              onChange={(e) => setEditFormEndDate(e.target.value)}
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
                value={editFormCourseId}
                onChange={(e) => setEditFormCourseId(e.target.value)}
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Status *</label>
            <div className="relative">
              <select
                required
                value={editFormStatus}
                onChange={(e) => setEditFormStatus(e.target.value as Batch["status"])}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground appearance-none cursor-pointer"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="COMPLETED">Completed</option>
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
              disabled={isUpdatingBatch}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUpdatingBatch ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
