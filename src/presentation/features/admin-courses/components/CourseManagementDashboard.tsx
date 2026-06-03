import { useState, useEffect, useCallback } from "react";
import {
  GripVertical, Plus, Trash2, Video, FileText, HelpCircle,
  BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle,
  ChevronsUpDown, ChevronsDownUp,
} from "lucide-react";
import { useCourse } from "@/presentation/features/student-learning/hooks/useCourses";
import { managementService } from "@/infrastructure/admin/managementService";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";

// ─── Local Types ──────────────────────────────────────────────────────────────

interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  purchasedAt: string;
}

interface AddModuleForm { title: string; sortOrder?: number }
interface AddChapterForm { title: string; type: ChapterType; sortOrder?: number }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "BEGINNER_TO_ADVANCED", label: "Beginner to Advanced" },
];

const CHAPTER_TYPE_COLORS: Record<ChapterType, string> = {
  VIDEO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DOCUMENT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  QUIZ: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function ChapterIcon({ type }: { type: ChapterType }) {
  if (type === "VIDEO") return <Video className="h-3.5 w-3.5 shrink-0 text-blue-400" />;
  if (type === "DOCUMENT") return <FileText className="h-3.5 w-3.5 shrink-0 text-amber-400" />;
  return <HelpCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />;
}

/** Drag-and-drop placeholder — reorders by sortOrder, returns updated list. */
function handleModuleReorder(modules: Module[], fromIdx: number, toIdx: number): Module[] {
  const list = [...modules];
  const [moved] = list.splice(fromIdx, 1);
  list.splice(toIdx, 0, moved);
  return list.map((m, i) => ({ ...m, sortOrder: i }));
}

function handleChapterReorder(chapters: Chapter[], fromIdx: number, toIdx: number): Chapter[] {
  const list = [...chapters];
  const [moved] = list.splice(fromIdx, 1);
  list.splice(toIdx, 0, moved);
  return list.map((c, i) => ({ ...c, sortOrder: i }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[var(--hairline)] bg-card ${className}`}>
      {children}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative -mb-px py-3 px-1 text-sm font-medium transition-colors ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[image:var(--gradient-primary)] rounded-full" />}
    </button>
  );
}

function InputField({
  label, id, value, onChange, type = "text", placeholder,
}: {
  label: string; id: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
      />
    </div>
  );
}

// ─── Inline "Add Module" Form ─────────────────────────────────────────────────

function AddModulePanel({
  onAdd, onCancel,
}: { onAdd: (f: AddModuleForm) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  return (
    <div className="mt-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 flex flex-col gap-3">
      <div className="flex gap-3 items-center">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Module title..."
          className="flex-1 rounded-md border border-[var(--hairline)] bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
        />
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          placeholder="Sort Order"
          className="w-24 rounded-md border border-[var(--hairline)] bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => onAdd({ title, sortOrder: sortOrder ? parseInt(sortOrder, 10) : undefined })}
          disabled={!title.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[image:var(--gradient-primary)] px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-primary)] disabled:opacity-40 transition"
        >
          <Check className="h-3.5 w-3.5" /> Add Module
        </button>
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition">
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Inline "Add Chapter" Form ────────────────────────────────────────────────

function AddChapterPanel({
  onAdd, onCancel,
}: { onAdd: (f: AddChapterForm) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ChapterType>("VIDEO");
  const [sortOrder, setSortOrder] = useState("");
  return (
    <div className="mt-2 rounded-lg border border-dashed border-primary/20 bg-primary/5 p-3 space-y-2">
      <div className="flex gap-3">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chapter title..."
          className="flex-1 rounded-md border border-[var(--hairline)] bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          placeholder="Sort Order"
          className="w-24 rounded-md border border-[var(--hairline)] bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        {(["VIDEO", "DOCUMENT", "QUIZ"] as ChapterType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition ${
              type === t ? CHAPTER_TYPE_COLORS[t] : "border-[var(--hairline)] text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => onAdd({ title, type, sortOrder: sortOrder ? parseInt(sortOrder, 10) : undefined })}
          disabled={!title.trim()}
          className="inline-flex items-center gap-1 rounded-lg bg-[image:var(--gradient-primary)] px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
        >
          <Check className="h-3 w-3" /> Add Lesson
        </button>
        <button onClick={onCancel} className="p-1.5 rounded-md hover:bg-foreground/5 text-muted-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Chapter Row ──────────────────────────────────────────────────────────────

function ChapterRow({
  chapter, index, moduleId, onDelete, onReorderChapters, onDragStartActive,
}: {
  chapter: Chapter;
  index: number;
  moduleId: string;
  onDelete: () => void;
  onReorderChapters: (fromIdx: number, toIdx: number) => void;
  onDragStartActive: () => void;
}) {
  const [dragEnabled, setDragEnabled] = useState(false);
  const [isDragPreview, setIsDragPreview] = useState(false);

  return (
    <li
      draggable={dragEnabled}
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData("text/plain", `chapter:${index}:${moduleId}`);
        setIsDragPreview(true);
        setTimeout(() => {
          setIsDragPreview(false);
          onDragStartActive();
        }, 0);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const data = e.dataTransfer.getData("text/plain");
        if (data.startsWith("chapter:")) {
          const [_, fromIdxStr, fromModuleId] = data.split(":");
          const fromIdx = parseInt(fromIdxStr, 10);
          if (fromModuleId === moduleId) {
            onReorderChapters(fromIdx, index);
          }
        }
      }}
      onDragEnd={() => setDragEnabled(false)}
      className={`group flex items-center gap-2.5 rounded-lg border border-[var(--hairline)] transition-all duration-300 ease-out cursor-grab active:cursor-grabbing ${
        isDragPreview
          ? "bg-white/10 backdrop-blur-md border-white/30 shadow-[0_8px_32px_rgba(255,255,255,0.15)] opacity-95 scale-[1.02] rotate-1"
          : "bg-background/40 hover:bg-foreground/[0.02]"
      } px-3 py-2.5 text-sm`}
    >
      <GripVertical
        className="h-4 w-4 text-muted-foreground/40 shrink-0"
        onMouseDown={() => setDragEnabled(true)}
        onMouseUp={() => setDragEnabled(false)}
      />
      <ChapterIcon type={chapter.type} />
      <span className="flex-1 text-foreground/90 font-medium truncate">{index + 1}. {chapter.title}</span>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${CHAPTER_TYPE_COLORS[chapter.type]}`}>
        {chapter.type}
      </span>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
        aria-label={`Delete ${chapter.title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

// ─── Module Row ───────────────────────────────────────────────────────────────

function ModuleRow({
  module, index, onDeleteChapter, onAddChapter, onReorderChapters, onReorderModules,
  isOpen, onToggle, onDragStartActive,
}: {
  module: Module;
  index: number;
  onDeleteChapter: (chapterId: string) => void;
  onAddChapter: (moduleId: string, form: AddChapterForm) => void;
  onReorderChapters: (fromIdx: number, toIdx: number) => void;
  onReorderModules: (fromIdx: number, toIdx: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  onDragStartActive: () => void;
}) {
  const [addingChapter, setAddingChapter] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [isDragPreview, setIsDragPreview] = useState(false);

  const [draggedChapterIndex, setDraggedChapterIndex] = useState<number | null>(null);
  const [dragOverChapterIndex, setDragOverChapterIndex] = useState<number | null>(null);

  const sortedChapters = [...(module.chapters ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div
      draggable={dragEnabled}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", `module:${index}`);
        setIsDragPreview(true);
        setTimeout(() => {
          setIsDragPreview(false);
          onDragStartActive();
        }, 0);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text/plain");
        if (data.startsWith("module:")) {
          const fromIndex = parseInt(data.split(":")[1], 10);
          onReorderModules(fromIndex, index);
        }
      }}
      onDragEnd={() => setDragEnabled(false)}
      className={`rounded-xl border border-[var(--hairline)] overflow-hidden transition-all duration-300 ease-out ${
        isDragPreview
          ? "bg-white/10 backdrop-blur-md border-white/30 shadow-[0_8px_32px_rgba(255,255,255,0.15)] opacity-95 scale-[1.02] rotate-1"
          : "bg-card"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--hairline)] bg-card/80">
        <GripVertical
          className="h-5 w-5 text-muted-foreground/40 cursor-grab shrink-0"
          onMouseDown={() => setDragEnabled(true)}
          onMouseUp={() => setDragEnabled(false)}
        />
        <span className="flex-1 font-semibold text-foreground text-sm">{index + 1}. {module.title}</span>
        <span className="text-xs text-muted-foreground">{sortedChapters.length} chapters</span>
        <button
          onClick={() => setAddingChapter(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hairline)] bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition cursor-pointer"
        >
          <Plus className="h-3 w-3" /> Add Lesson
        </button>
        <button onClick={onToggle} className="p-1 text-muted-foreground hover:text-foreground transition cursor-pointer">
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
        </button>
      </div>

      {isOpen && (
        <div className="p-4 space-y-2">
          {sortedChapters.length > 0 ? (
            <ul className="space-y-1.5">
              {sortedChapters.map((ch, chIdx) => (
                <div
                  key={ch.id}
                  onDragEnter={() => {
                    if (draggedChapterIndex !== null) {
                      setDragOverChapterIndex(chIdx);
                    }
                  }}
                  onDragLeave={() => {
                    setDragOverChapterIndex((prev) => (prev === chIdx ? null : prev));
                  }}
                  onDragEnd={() => {
                    setDraggedChapterIndex(null);
                    setDragOverChapterIndex(null);
                  }}
                  className={`transition-all duration-150 ${
                    draggedChapterIndex === chIdx ? "opacity-35 scale-[0.99]" : ""
                  } ${
                    dragOverChapterIndex === chIdx && draggedChapterIndex !== chIdx
                      ? "border-2 border-dashed border-blue-400/50 bg-blue-500/5 rounded-lg p-0.5"
                      : ""
                  }`}
                >
                  <ChapterRow
                    chapter={ch}
                    index={chIdx}
                    moduleId={module.id}
                    onDelete={() => onDeleteChapter(ch.id)}
                    onReorderChapters={(fromIdx, toIdx) => {
                      onReorderChapters(fromIdx, toIdx);
                      setDraggedChapterIndex(null);
                      setDragOverChapterIndex(null);
                    }}
                    onDragStartActive={() => setDraggedChapterIndex(chIdx)}
                  />
                </div>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No chapters yet. Add one below.</p>
          )}
          {addingChapter ? (
            <AddChapterPanel
              onAdd={(f) => { onAddChapter(module.id, f); setAddingChapter(false); }}
              onCancel={() => setAddingChapter(false)}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Left Column: Curriculum ──────────────────────────────────────────────────

function CurriculumPanel({
  modules, onAddModule, onAddChapter, onDeleteChapter, onReorderModules, onReorderChapters,
}: {
  modules: Module[];
  onAddModule: (f: AddModuleForm) => void;
  onAddChapter: (moduleId: string, form: AddChapterForm) => void;
  onDeleteChapter: (moduleId: string, chapterId: string) => void;
  onReorderModules: (fromIdx: number, toIdx: number) => void;
  onReorderChapters: (moduleId: string, fromIdx: number, toIdx: number) => void;
}) {
  const [addingModule, setAddingModule] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(true);

  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
  const [dragOverModuleIndex, setDragOverModuleIndex] = useState<number | null>(null);

  const sorted = [...modules].sort((a, b) => a.sortOrder - b.sortOrder);

  const isModuleOpen = (moduleId: string) => expandedModules[moduleId] !== false;

  const handleToggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: prev[moduleId] === false ? true : false,
    }));
  };

  const handleToggleExpandCollapseAll = () => {
    if (allExpanded) {
      const collapsed: Record<string, boolean> = {};
      modules.forEach((m) => {
        collapsed[m.id] = false;
      });
      setExpandedModules(collapsed);
      setAllExpanded(false);
    } else {
      setExpandedModules({});
      setAllExpanded(true);
    }
  };

  return (
    <SectionCard>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--hairline)]">
        <div>
          <h2 className="font-display font-bold text-base text-foreground">Course Curriculum</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{modules.length} modules</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleExpandCollapseAll}
            title={allExpanded ? "Collapse All Modules" : "Expand All Modules"}
            className="p-2 rounded-lg border border-[var(--hairline)] bg-card text-muted-foreground hover:text-foreground transition cursor-pointer"
            aria-label={allExpanded ? "Collapse All" : "Expand All"}
          >
            {allExpanded ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setAddingModule(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add New Module
          </button>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {sorted.length === 0 && !addingModule && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No modules yet. Add your first module.</p>
          </div>
        )}

        {sorted.map((mod, index) => (
          <div
            key={mod.id}
            onDragEnter={() => {
              if (draggedModuleIndex !== null) {
                setDragOverModuleIndex(index);
              }
            }}
            onDragLeave={() => {
              setDragOverModuleIndex((prev) => (prev === index ? null : prev));
            }}
            onDragEnd={() => {
              setDraggedModuleIndex(null);
              setDragOverModuleIndex(null);
            }}
            className={`transition-all duration-200 ${
              draggedModuleIndex === index ? "opacity-40 scale-[0.98]" : ""
            } ${
              dragOverModuleIndex === index && draggedModuleIndex !== index
                ? "border-2 border-dashed border-primary/60 bg-primary/5 rounded-xl p-1"
                : ""
            }`}
          >
            <ModuleRow
              module={mod}
              index={index}
              isOpen={isModuleOpen(mod.id)}
              onToggle={() => handleToggleModule(mod.id)}
              onDeleteChapter={(chId) => onDeleteChapter(mod.id, chId)}
              onAddChapter={onAddChapter}
              onReorderChapters={(fromIdx, toIdx) => onReorderChapters(mod.id, fromIdx, toIdx)}
              onReorderModules={(fromIdx, toIdx) => {
                onReorderModules(fromIdx, toIdx);
                setDraggedModuleIndex(null);
                setDragOverModuleIndex(null);
              }}
              onDragStartActive={() => setDraggedModuleIndex(index)}
            />
          </div>
        ))}

        {addingModule && (
          <AddModulePanel
            onAdd={(f) => { onAddModule(f); setAddingModule(false); }}
            onCancel={() => setAddingModule(false)}
          />
        )}
      </div>
    </SectionCard>
  );
}

// ─── Right Column: Config Tabs ────────────────────────────────────────────────

function EditDetailsTab({
  course, instructors,
}: { course: Course; instructors: Instructor[] }) {
  const [title, setTitle] = useState(course.title);
  const [level, setLevel] = useState<CourseLevel>(course.level);
  const [price, setPrice] = useState(String(course.price));
  const [instructorId, setInstructorId] = useState(course.instructorId ?? "");

  return (
    <div className="p-5 space-y-5">
      <InputField label="Course Title" id="edit-title" value={title} onChange={setTitle} placeholder="e.g. React Mastery" />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="edit-level" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Level</label>
        <select
          id="edit-level"
          value={level}
          onChange={(e) => setLevel(e.target.value as CourseLevel)}
          className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2.5 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
        >
          {LEVEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <InputField label="Price (₹)" id="edit-price" type="number" value={price} onChange={setPrice} placeholder="0" />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="edit-instructor" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Assign Instructor
        </label>
        <select
          id="edit-instructor"
          value={instructorId}
          onChange={(e) => setInstructorId(e.target.value)}
          className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2.5 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
        >
          <option value="">— Unassigned —</option>
          {instructors.map((ins) => (
            <option key={ins.id} value={ins.id}>{ins.name} · {ins.designation}</option>
          ))}
        </select>
        <p className="text-[11px] text-muted-foreground">Linked via <code className="font-mono text-primary/80">instructorId</code> on the Course model.</p>
      </div>

      <div className="pt-2">
        <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-primary)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-primary)] hover:opacity-90 transition">
          <Save className="h-4 w-4" /> Save Details
        </button>
      </div>
    </div>
  );
}

function EnrolledStudentsTab({ students }: { students: EnrolledStudent[] }) {
  return (
    <div className="p-5">
      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {students.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-lg border border-[var(--hairline)] bg-background/40 px-3 py-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-xs font-bold text-primary-foreground">
                {s.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">{s.email}</p>
              </div>
              <p className="text-[11px] text-muted-foreground shrink-0">
                {new Date(s.purchasedAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ConfigPanel({ course, instructors }: { course: Course; instructors: Instructor[] }) {
  const [tab, setTab] = useState<"details" | "students">("details");

  // Mock enrolled students derived from course.totalStudents count
  const mockStudents: EnrolledStudent[] = Array.from({ length: Math.min(course.totalStudents, 5) }, (_, i) => ({
    id: `s${i}`,
    name: ["Arjun Mehta", "Priya Sharma", "Ravi Kumar", "Ananya Singh", "Siddharth Nair"][i] ?? `Student ${i + 1}`,
    email: `student${i + 1}@example.com`,
    purchasedAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  }));

  return (
    <SectionCard>
      <div className="flex gap-6 px-5 border-b border-[var(--hairline)]">
        <TabButton label="Edit Details & Instructor" active={tab === "details"} onClick={() => setTab("details")} />
        <TabButton label={`Enrolled Students (${course.totalStudents})`} active={tab === "students"} onClick={() => setTab("students")} />
      </div>

      {tab === "details" && <EditDetailsTab course={course} instructors={instructors} />}
      {tab === "students" && <EnrolledStudentsTab students={mockStudents} />}
    </SectionCard>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function CourseManagementDashboard({ slug }: { slug: string }) {
  const { data: course, isLoading, isError } = useCourse(slug);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [localModules, setLocalModules] = useState<Module[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    if (course?.modules) setLocalModules(course.modules);
  }, [course]);

  useEffect(() => {
    managementService.getInstructors().then(setInstructors);
  }, []);

  const handleAddModule = useCallback((form: AddModuleForm) => {
    if (!form.title.trim()) return;
    setLocalModules((prev) => {
      const order = form.sortOrder !== undefined ? form.sortOrder : prev.length;
      const newModule: Module = {
        id: `new-mod-${Date.now()}`,
        title: form.title,
        sortOrder: order,
        courseId: course?.id ?? "",
        chapters: [],
      };
      const updated = [...prev, newModule].sort((a, b) => a.sortOrder - b.sortOrder);
      return updated.map((m, idx) => ({ ...m, sortOrder: idx }));
    });
  }, [course?.id]);

  const handleAddChapter = useCallback((moduleId: string, form: AddChapterForm) => {
    if (!form.title.trim()) return;
    setLocalModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        const currentChapters = mod.chapters ?? [];
        const order = form.sortOrder !== undefined ? form.sortOrder : currentChapters.length;
        const newChapter: Chapter = {
          id: `new-ch-${Date.now()}`,
          title: form.title,
          type: form.type,
          sortOrder: order,
          isPreview: false,
          videoUrl: null,
          duration: null,
          documentUrl: null,
          moduleId,
          quizzes: [],
        };
        const updatedChapters = [...currentChapters, newChapter].sort((a, b) => a.sortOrder - b.sortOrder);
        return {
          ...mod,
          chapters: updatedChapters.map((c, idx) => ({ ...c, sortOrder: idx })),
        };
      })
    );
  }, []);

  const handleDeleteChapter = useCallback((moduleId: string, chapterId: string) => {
    setLocalModules((prev) =>
      prev.map((mod) =>
        mod.id !== moduleId
          ? mod
          : { ...mod, chapters: (mod.chapters ?? []).filter((c) => c.id !== chapterId) }
      )
    );
  }, []);

  const handleReorderModules = useCallback((fromIdx: number, toIdx: number) => {
    setLocalModules((prev) => handleModuleReorder(prev, fromIdx, toIdx));
  }, []);

  const handleReorderChapters = useCallback((moduleId: string, fromIdx: number, toIdx: number) => {
    setLocalModules((prev) =>
      prev.map((mod) =>
        mod.id !== moduleId
          ? mod
          : { ...mod, chapters: handleChapterReorder(mod.chapters ?? [], fromIdx, toIdx) }
      )
    );
  }, []);

  const handleSaveAll = useCallback(async () => {
    setSaveStatus("saving");
    // Placeholder — wire up to your API
    await new Promise((r) => setTimeout(r, 800));
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, []);

  // ── Loading ──
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

  // ── Error ──
  if (isError || !course) {
    return (
      <main className="flex-1 px-6 py-6 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="font-display font-bold text-lg text-foreground">Course not found</h2>
        <p className="text-sm text-muted-foreground mt-1">The course with slug "{slug}" could not be loaded.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 pb-8 sm:px-6 lg:px-8 overflow-y-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight md:text-3xl">
            {course.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Course Management Dashboard</p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saveStatus === "saving"}
          className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-primary)] hover:opacity-90 active:scale-[0.98] transition disabled:opacity-60 shrink-0"
        >
          {saveStatus === "saving" ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving…
            </>
          ) : saveStatus === "saved" ? (
            <><Check className="h-4 w-4" /> Saved!</>
          ) : (
            <><Save className="h-4 w-4" /> Save All Changes</>
          )}
        </button>
      </div>

      {/* ── Quick Stats Bar ── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Modules", value: localModules.length },
          { label: "Chapters", value: localModules.reduce((s, m) => s + (m.chapters?.length ?? 0), 0) },
          { label: "Students", value: course.totalStudents },
          { label: "Level", value: LEVEL_OPTIONS.find((l) => l.value === course.level)?.label ?? course.level },
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

      {/* ── Two-Column Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Curriculum */}
        <div className="lg:col-span-7">
          <CurriculumPanel
            modules={localModules}
            onAddModule={handleAddModule}
            onAddChapter={handleAddChapter}
            onDeleteChapter={handleDeleteChapter}
            onReorderModules={handleReorderModules}
            onReorderChapters={handleReorderChapters}
          />
        </div>

        {/* Right: Config Tabs */}
        <div className="lg:col-span-5">
          <ConfigPanel course={course} instructors={instructors} />
        </div>
      </div>
    </main>
  );
}
