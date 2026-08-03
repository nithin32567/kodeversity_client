import { useState, useEffect } from "react";
import { Sparkles, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { instructorService } from "@/infrastructure/instructor/instructorService";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "BEGINNER_TO_ADVANCED"];

export function CreateCourseModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
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
        subtitle: "Comprehensive course on " + title.trim(),
        description: description.trim() || "No description provided.",
        level,
        price: price === "" ? 0 : Number(price),
        currency: "INR",
        thumbnailUrl: coverImageUrl.trim() || undefined,
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
