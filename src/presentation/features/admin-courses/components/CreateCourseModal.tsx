import React from "react";
import { X, Sparkles, ChevronDown, DollarSign } from "lucide-react";
import { useCreateCourseModal } from "./create-course/useCreateCourseModal";
import { InstructorSection } from "./create-course/InstructorSection";
import { levelLabels } from "./create-course/utils";
import type { CreateCourseModalProps } from "./create-course/types";
import type { CourseLevel } from "@/domain/course";

export function CreateCourseModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  instructors,
  levels,
}: CreateCourseModalProps) {
  const { state, actions } = useCreateCourseModal(isOpen, instructors, onSubmitSuccess, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--hairline)] bg-[var(--surface-2)]/60">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold font-display">Create New Course</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-lg border border-[var(--hairline)] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={(e) => void actions.handleSubmit(e)}
          data-lenis-prevent
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={state.formState.title}
                onChange={actions.handleTitleChange}
                placeholder="e.g. Master React 19 from Scratch"
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                URL Slug *
                <span className="text-[10px] text-muted-foreground/60 lowercase italic">
                  (must be unique)
                </span>
              </label>
              <input
                type="text"
                required
                value={state.formState.slug}
                onChange={actions.handleSlugChange}
                placeholder="e.g. master-react-19"
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition font-mono"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Course Subtitle *
            </label>
            <input
              type="text"
              required
              value={state.formState.subtitle}
              onChange={(e) =>
                actions.setFormState((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              placeholder="e.g. Learn components, hooks, server actions, and deploy production apps."
              className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={state.formState.description}
              onChange={(e) =>
                actions.setFormState((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Provide a comprehensive course description for students..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Difficulty Level
              </label>
              <div className="relative">
                <select
                  value={state.formState.level}
                  onChange={(e) =>
                    actions.setFormState((prev) => ({
                      ...prev,
                      level: e.target.value as CourseLevel,
                    }))
                  }
                  className="w-full appearance-none px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {levelLabels[lvl] || lvl}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Instructor Section */}
            <InstructorSection
              localInstructors={state.localInstructors}
              showAddInstructor={state.showAddInstructor}
              setShowAddInstructor={actions.setShowAddInstructor}
              instructorId={state.formState.instructorId}
              setInstructorId={(id) =>
                actions.setFormState((prev) => ({ ...prev, instructorId: id }))
              }
              newInstructor={state.newInstructor}
              setNewInstructor={actions.setNewInstructor}
              isCreatingInstructor={state.isCreatingInstructor}
              handleCreateInstructor={actions.handleCreateInstructor}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[var(--surface-2)]/30 border border-[var(--hairline)]">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={state.formState.price}
                  onChange={(e) =>
                    actions.setFormState((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="99.99"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Discount Price (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={state.formState.discountPrice || ""}
                  onChange={(e) =>
                    actions.setFormState((prev) => ({ ...prev, discountPrice: e.target.value }))
                  }
                  placeholder="79.99"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Currency
              </label>
              <input
                type="text"
                required
                value={state.formState.currency}
                onChange={(e) =>
                  actions.setFormState((prev) => ({ ...prev, currency: e.target.value }))
                }
                placeholder="USD"
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-indigo-500 transition font-semibold"
              />
            </div>
          </div>

          {/* Media Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Thumbnail Image URL
              </label>
              <input
                type="url"
                value={state.formState.thumbnailUrl}
                onChange={(e) =>
                  actions.setFormState((prev) => ({ ...prev, thumbnailUrl: e.target.value }))
                }
                placeholder="https://example.com/images/course-thumb.jpg"
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Promo Video URL
              </label>
              <input
                type="url"
                value={state.formState.promoVideoUrl}
                onChange={(e) =>
                  actions.setFormState((prev) => ({ ...prev, promoVideoUrl: e.target.value }))
                }
                placeholder="https://example.com/videos/promo.mp4"
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Duration (in minutes)
              </label>
              <input
                type="number"
                required
                min="1"
                value={state.formState.totalDuration}
                onChange={(e) =>
                  actions.setFormState((prev) => ({ ...prev, totalDuration: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Lessons Count
              </label>
              <input
                type="number"
                required
                min="1"
                value={state.formState.lessonsCount}
                onChange={(e) =>
                  actions.setFormState((prev) => ({ ...prev, lessonsCount: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Projects Count
              </label>
              <input
                type="number"
                required
                min="0"
                value={state.formState.projectsCount}
                onChange={(e) =>
                  actions.setFormState((prev) => ({ ...prev, projectsCount: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)]/20 border border-[var(--hairline)]">
            <input
              type="checkbox"
              id="hasCertificate"
              checked={state.formState.hasCertificate}
              onChange={(e) =>
                actions.setFormState((prev) => ({ ...prev, hasCertificate: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-500"
            />
            <label htmlFor="hasCertificate" className="text-sm font-medium text-foreground/80">
              Provide certificate of completion upon graduation
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                What students will learn (one per line)
              </label>
              <textarea
                rows={4}
                value={state.formState.whatYouWillLearnRaw}
                onChange={(e) =>
                  actions.setFormState((prev) => ({
                    ...prev,
                    whatYouWillLearnRaw: e.target.value,
                  }))
                }
                placeholder="Master React fundamentals&#10;Deploy Server Components"
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition resize-none font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                What this course includes (one per line)
              </label>
              <textarea
                rows={4}
                value={state.formState.courseIncludesRaw}
                onChange={(e) =>
                  actions.setFormState((prev) => ({ ...prev, courseIncludesRaw: e.target.value }))
                }
                placeholder="10 hours on-demand video&#10;5 coding challenges"
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition resize-none font-sans"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--hairline)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-[var(--hairline)] hover:bg-white/[0.04] active:scale-[0.98] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={state.isSubmitting}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[image:var(--gradient-cta)] text-white hover:opacity-90 active:scale-[0.98] transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {state.isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Course</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
