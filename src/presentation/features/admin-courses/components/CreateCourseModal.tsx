import React, { useState, useCallback, useEffect } from "react";
import { X, Sparkles, ChevronDown, DollarSign, Plus } from "lucide-react";
import { managementService } from "@/infrastructure/admin/managementService";
import type { CourseLevel, Instructor } from "@/domain/course";
import { toast } from "sonner";

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  BEGINNER_TO_ADVANCED: "All Levels",
};

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  instructors: Instructor[];
  levels: string[];
}

const initialFormState = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  thumbnailUrl: "",
  promoVideoUrl: "",
  price: "",
  discountPrice: "",
  currency: "USD",
  level: "BEGINNER" as CourseLevel,
  totalDuration: "60", // Default to 1 hour (60 minutes)
  lessonsCount: "10",
  projectsCount: "2",
  hasCertificate: true,
  whatYouWillLearnRaw:
    "Master the fundamentals\nBuild hands-on projects\nUnderstand advanced patterns",
  courseIncludesRaw: "On-demand videos\nHands-on assignments\nCertificate of completion",
  instructorId: "",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateCourseModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  instructors,
  levels,
}: CreateCourseModalProps) {
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manuallyEditedSlug, setManuallyEditedSlug] = useState(false);

  const [localInstructors, setLocalInstructors] = useState<Instructor[]>([]);
  const [showAddInstructor, setShowAddInstructor] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    name: "",
    designation: "",
    bio: "",
    avatarUrl: "",
  });
  const [isCreatingInstructor, setIsCreatingInstructor] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalInstructors(instructors);
      setShowAddInstructor(false);
    }
  }, [isOpen, instructors]);

  const handleCreateInstructor = async () => {
    if (!newInstructor.name || !newInstructor.designation || !newInstructor.bio) {
      toast.error("Please fill in all required fields (Name, Designation, and Bio).");
      return;
    }

    setIsCreatingInstructor(true);
    try {
      const created = await managementService.createInstructor({
        name: newInstructor.name,
        designation: newInstructor.designation,
        bio: newInstructor.bio,
        avatarUrl: newInstructor.avatarUrl || null,
      });

      toast.success("Instructor created successfully!");
      setLocalInstructors((prev) => [...prev, created]);
      setFormState((prev) => ({ ...prev, instructorId: created.id }));
      setNewInstructor({
        name: "",
        designation: "",
        bio: "",
        avatarUrl: "",
      });
      setShowAddInstructor(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create instructor.");
    } finally {
      setIsCreatingInstructor(false);
    }
  };

  // Update slug when title changes, unless manually edited
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setFormState((prev) => ({
        ...prev,
        title: val,
        slug: manuallyEditedSlug ? prev.slug : slugify(val),
      }));
    },
    [manuallyEditedSlug],
  );

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setManuallyEditedSlug(true);
    setFormState((prev) => ({ ...prev, slug: e.target.value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showAddInstructor) {
      toast.error("Please save or cancel the instructor creation form first.");
      return;
    }
    if (!formState.title || !formState.slug || !formState.subtitle || !formState.description) {
      toast.error("Please fill in all required fields (Title, Slug, Subtitle, and Description).");
      return;
    }

    setIsSubmitting(true);

    const priceNum = parseFloat(formState.price);
    const discPriceNum = formState.discountPrice ? parseFloat(formState.discountPrice) : null;
    const durationNum = parseInt(formState.totalDuration, 10);
    const lessonsNum = parseInt(formState.lessonsCount, 10);
    const projectsNum = parseInt(formState.projectsCount, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Price must be a valid number greater than or equal to 0.");
      setIsSubmitting(false);
      return;
    }

    if (discPriceNum !== null && (isNaN(discPriceNum) || discPriceNum < 0)) {
      toast.error("Discount price must be a valid number greater than or equal to 0.");
      setIsSubmitting(false);
      return;
    }

    if (discPriceNum !== null && discPriceNum > priceNum) {
      toast.error("Discount price must be less than or equal to the base price.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title: formState.title,
      slug: formState.slug,
      subtitle: formState.subtitle,
      description: formState.description,
      promoVideoUrl: formState.promoVideoUrl || null,
      thumbnailUrl: formState.thumbnailUrl || null,
      price: priceNum,
      discountPrice: discPriceNum,
      currency: formState.currency,
      level: formState.level,
      totalDuration: isNaN(durationNum) ? 60 : durationNum,
      lessonsCount: isNaN(lessonsNum) ? 5 : lessonsNum,
      projectsCount: isNaN(projectsNum) ? 1 : projectsNum,
      hasCertificate: formState.hasCertificate,
      whatYouWillLearn: formState.whatYouWillLearnRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      courseIncludes: formState.courseIncludesRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      instructorId: formState.instructorId || null,
    };

    try {
      await managementService.createCourse(payload);
      toast.success("Course created successfully!");
      setFormState({
        ...initialFormState,
        instructorId: "",
      });
      setManuallyEditedSlug(false);
      onSubmitSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      let errMsg = "Failed to create course.";
      if (err instanceof Error) {
        const code = (err as Error & { code?: string }).code;
        if (code === "SLUG_ALREADY_EXISTS") {
          errMsg = "A course with this URL slug already exists. Please choose a unique slug.";
        } else if (code === "INSTRUCTOR_NOT_FOUND") {
          errMsg = "The selected instructor was not found.";
        } else if (code === "UNAUTHORIZED") {
          errMsg = "You are not authorized to create courses. Please log in again.";
        } else {
          errMsg = err.message || errMsg;
        }
      }
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      {/* Modal Card */}
      <div className="relative w-full max-w-3xl rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
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

        {/* Modal Body Form */}
        <form
          onSubmit={handleSubmit}
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
                value={formState.title}
                onChange={handleTitleChange}
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
                value={formState.slug}
                onChange={handleSlugChange}
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
              value={formState.subtitle}
              onChange={(e) => setFormState((prev) => ({ ...prev, subtitle: e.target.value }))}
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
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
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
                  value={formState.level}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, level: e.target.value as CourseLevel }))
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

            {/* Instructor */}
            <div className="space-y-2 border border-[var(--hairline)] p-4 rounded-xl bg-[var(--surface-2)]/30">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Instructor (Optional)
                </label>
                {!showAddInstructor && (
                  <button
                    type="button"
                    onClick={() => setShowAddInstructor(true)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create New Instructor</span>
                  </button>
                )}
              </div>

              {!showAddInstructor ? (
                <div className="relative">
                  <select
                    value={formState.instructorId}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, instructorId: e.target.value }))
                    }
                    className="w-full appearance-none px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="">No Instructor Assigned</option>
                    {localInstructors.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.name} ({ins.designation})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none font-sans" />
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={newInstructor.name}
                        onChange={(e) =>
                          setNewInstructor((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Designation *
                      </label>
                      <input
                        type="text"
                        placeholder="Principal Engineer"
                        value={newInstructor.designation}
                        onChange={(e) =>
                          setNewInstructor((prev) => ({ ...prev, designation: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Bio *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Software developer with over 10 years of instruction experience."
                      value={newInstructor.bio}
                      onChange={(e) =>
                        setNewInstructor((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm focus:outline-none focus:border-indigo-500 transition resize-none font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Avatar Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/avatars/john.jpg"
                      value={newInstructor.avatarUrl}
                      onChange={(e) =>
                        setNewInstructor((prev) => ({ ...prev, avatarUrl: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm focus:outline-none focus:border-indigo-500 transition font-sans"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddInstructor(false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--hairline)] hover:bg-white/[0.04] transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isCreatingInstructor}
                      onClick={handleCreateInstructor}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {isCreatingInstructor ? (
                        <>
                          <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Instructor</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing section */}
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
                  value={formState.price}
                  onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
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
                  value={formState.discountPrice || ""}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, discountPrice: e.target.value }))
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
                value={formState.currency}
                onChange={(e) => setFormState((prev) => ({ ...prev, currency: e.target.value }))}
                placeholder="USD"
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-indigo-500 transition font-semibold"
              />
            </div>
          </div>

          {/* Media links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Thumbnail Image URL
              </label>
              <input
                type="url"
                value={formState.thumbnailUrl}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, thumbnailUrl: e.target.value }))
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
                value={formState.promoVideoUrl}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, promoVideoUrl: e.target.value }))
                }
                placeholder="https://example.com/videos/promo.mp4"
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Duration (in minutes)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formState.totalDuration}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, totalDuration: e.target.value }))
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
                value={formState.lessonsCount}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, lessonsCount: e.target.value }))
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
                value={formState.projectsCount}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, projectsCount: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)]/20 border border-[var(--hairline)]">
            <input
              type="checkbox"
              id="hasCertificate"
              checked={formState.hasCertificate}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, hasCertificate: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-500"
            />
            <label htmlFor="hasCertificate" className="text-sm font-medium text-foreground/80">
              Provide certificate of completion upon graduation
            </label>
          </div>

          {/* What you will learn & Includes lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                What students will learn (one per line)
              </label>
              <textarea
                rows={4}
                value={formState.whatYouWillLearnRaw}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, whatYouWillLearnRaw: e.target.value }))
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
                value={formState.courseIncludesRaw}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, courseIncludesRaw: e.target.value }))
                }
                placeholder="10 hours on-demand video&#10;5 coding challenges"
                className="w-full px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition resize-none font-sans"
              />
            </div>
          </div>

          {/* Modal Actions */}
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
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[image:var(--gradient-cta)] text-white hover:opacity-90 active:scale-[0.98] transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
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
