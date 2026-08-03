import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2, Video, FileText, HelpCircle, BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle, ChevronsUpDown, ChevronsDownUp, Upload, TerminalSquare, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { User } from "@/domain/user";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";

import { InputField } from './ui';
import { SearchableInstructorSelect } from './SearchableInstructorSelect';
import { LEVEL_OPTIONS } from '../utils';
export function EditDetailsTab({
  course,
  instructors,
  onSaveInstructor,
}: {
  course: Course;
  instructors: Instructor[];
  onSaveInstructor: (instructorId: string | null) => Promise<void>;
}) {
  const { user } = useAuth();
  const isInstructor = user?.role === "INSTRUCTOR";

  const [title, setTitle] = useState(course.title);
  const [level, setLevel] = useState<CourseLevel>(course.level);
  const [price, setPrice] = useState(String(course.price));
  const [instructorId, setInstructorId] = useState(course.instructorId ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSave = async () => {
    if (isInstructor) return;
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await onSaveInstructor(instructorId || null);
      setSaveStatus({
        type: "success",
        message:
          "Instructor updated! (Note: general details updates are not supported by the API yet)",
      });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to update instructor.";
      setSaveStatus({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 space-y-5">
      <InputField
        label="Course Title"
        id="edit-title"
        value={title}
        onChange={setTitle}
        placeholder="e.g. React Mastery"
        disabled={isInstructor}
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="edit-level"
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
        >
          Level
        </label>
        <select
          id="edit-level"
          value={level}
          disabled={isInstructor}
          onChange={(e) => setLevel(e.target.value as CourseLevel)}
          className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2.5 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {LEVEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <InputField
        label="Price (₹)"
        id="edit-price"
        type="number"
        value={price}
        onChange={setPrice}
        placeholder="0"
        disabled={isInstructor}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Assign Instructor
        </label>
        <SearchableInstructorSelect
          instructors={instructors}
          value={instructorId}
          onChange={setInstructorId}
          disabled={isInstructor}
        />
      </div>

      {isInstructor && (
        <div className="p-3 rounded-xl border border-blue-500/10 bg-blue-500/5 text-blue-400 text-xs flex gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Course metadata is managed by admins. To modify titles or prices, please contact
            support.
          </span>
        </div>
      )}

      {saveStatus && (
        <div
          className={`p-3 rounded-lg text-xs border ${
            saveStatus.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      {!isInstructor && (
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-primary)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-primary)] hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Details
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}