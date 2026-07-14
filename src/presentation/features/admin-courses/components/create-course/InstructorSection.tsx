import { Plus } from "lucide-react";
import type { Instructor } from "@/domain/course";

interface InstructorSectionProps {
  localInstructors: Instructor[];
  showAddInstructor: boolean;
  setShowAddInstructor: (val: boolean) => void;
  instructorId: string;
  setInstructorId: (id: string) => void;
  newInstructor: {
    name: string;
    designation: string;
    bio: string;
    avatarUrl: string;
  };
  setNewInstructor: React.Dispatch<
    React.SetStateAction<{
      name: string;
      designation: string;
      bio: string;
      avatarUrl: string;
    }>
  >;
  isCreatingInstructor: boolean;
  handleCreateInstructor: () => Promise<void>;
}

export function InstructorSection({
  localInstructors,
  showAddInstructor,
  setShowAddInstructor,
  instructorId,
  setInstructorId,
  newInstructor,
  setNewInstructor,
  isCreatingInstructor,
  handleCreateInstructor,
}: InstructorSectionProps) {
  return (
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
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full appearance-none px-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">No Instructor Assigned</option>
            {localInstructors.map((ins) => (
              <option key={ins.id} value={ins.id}>
                {ins.name} ({ins.designation})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none font-sans">
            ▼
          </div>
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
                onChange={(e) => setNewInstructor((prev) => ({ ...prev, name: e.target.value }))}
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
              onChange={(e) => setNewInstructor((prev) => ({ ...prev, bio: e.target.value }))}
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
              onChange={(e) => setNewInstructor((prev) => ({ ...prev, avatarUrl: e.target.value }))}
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
              onClick={() => void handleCreateInstructor()}
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
  );
}
