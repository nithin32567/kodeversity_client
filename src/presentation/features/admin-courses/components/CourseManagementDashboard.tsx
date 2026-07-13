import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  BookOpen,
  Save,
  ChevronDown,
  Users,
  Edit3,
  X,
  Check,
  AlertCircle,
  ChevronsUpDown,
  ChevronsDownUp,
  Upload,
  TerminalSquare,
  PlayCircle,
} from "lucide-react";
import { useCourse } from "@/presentation/features/student-learning/hooks/useCourses";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { useSuspendCourseMutation, useDeleteCourseMutation } from "@/features/admin/adminApi";
import { toast } from "sonner";
import { useConfirm } from "@/presentation/global/contexts/ConfirmContext";
import type {
  Course,
  Module,
  Chapter,
  ChapterType,
  CourseLevel,
  Instructor,
} from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";

interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  purchasedAt: string;
}

interface AddModuleForm {
  title: string;
  description?: string;
  sortOrder?: number;
}
interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface AddChapterForm {
  title: string;
  description?: string;
  type: ChapterType;
  sortOrder?: number;
  videoUrl?: string | null;
  duration?: number | null;
  documentUrl?: string | null;
  playgroundConfig?: PlaygroundConfig | null;
  quizzes?:
    | {
        title: string;
        questions: {
          questionText: string;
          options: string[];
          correctAnswer: string;
        }[];
      }[]
    | null;
}

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
  PLAYGROUND: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

function ChapterIcon({ type }: { type: ChapterType }) {
  if (type === "VIDEO") return <Video className="h-3.5 w-3.5 shrink-0 text-blue-400" />;
  if (type === "DOCUMENT") return <FileText className="h-3.5 w-3.5 shrink-0 text-amber-400" />;
  if (type === "PLAYGROUND")
    return <TerminalSquare className="h-3.5 w-3.5 shrink-0 text-purple-400" />;
  return <HelpCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />;
}

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

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-[var(--hairline)] bg-card ${className}`}>
      {children}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative -mb-px py-3 px-1 text-sm font-medium transition-colors ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[image:var(--gradient-primary)] rounded-full" />
      )}
    </button>
  );
}

function InputField({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
}: {
  label: string;
  id: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ─── Inline "Add Module" Form ─────────────────────────────────────────────────

function AddModulePanel({
  onAdd,
  onCancel,
}: {
  onAdd: (f: AddModuleForm) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Module description (optional)..."
        className="w-full rounded-md border border-[var(--hairline)] bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={() =>
            onAdd({
              title,
              description,
              sortOrder: sortOrder ? parseInt(sortOrder, 10) : undefined,
            })
          }
          disabled={!title.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[image:var(--gradient-primary)] px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-primary)] disabled:opacity-40 transition"
        >
          <Check className="h-3.5 w-3.5" /> Add Module
        </button>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Inline "Add Chapter" Form ────────────────────────────────────────────────

const PRESETS = [
  {
    id: "1vmpg",
    name: "Ubuntu 24.04 LTS (1 VM)",
    pg: "6659f131a9de4f16462740bc",
    pgname: "1VMPG",
    playground: "ubuntu2404n1",
  },
  {
    id: "2vmpg",
    name: "2 VM Network (2 VMs)",
    pg: "6659f131a9de4f16462740bd",
    pgname: "2VMPG",
    playground: "ubuntu2404n2",
  },
  {
    id: "dockerpg",
    name: "Docker Workspace (1 VM)",
    pg: "6659f131a9de4f16462740be",
    pgname: "DOCKERPG",
    playground: "ubuntu2404n1-docker",
  },
  {
    id: "3ansbl",
    name: "Ansible Playground (3 VMs)",
    pg: "6659f131a9de4f16462740bf",
    pgname: "3ANSBL",
    playground: "ubuntu2404n3-ansible",
  },
];

function AddChapterPanel({
  onAdd,
  onCancel,
}: {
  onAdd: (f: AddChapterForm) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ChapterType>("VIDEO");
  const [sortOrder, setSortOrder] = useState("");

  // Video states
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");

  // Document states
  const [documentUrl, setDocumentUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Playground states
  const [pgTemplate, setPgTemplate] = useState("1vmpg");
  const [pgId, setPgId] = useState("6659f131a9de4f16462740bc");
  const [pgName, setPgName] = useState("1VMPG");
  const [pgPlayground, setPgPlayground] = useState("ubuntu2404n1");
  const [pgDifficulty, setPgDifficulty] = useState<"easy" | "medium" | "hard" | "expert">("easy");
  const [pgMaxScore, setPgMaxScore] = useState("100");
  const [showAdvancedPg, setShowAdvancedPg] = useState(false);

  const handleTemplateChange = (presetId: string) => {
    setPgTemplate(presetId);
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setPgId(preset.pg);
      setPgName(preset.pgname);
      setPgPlayground(preset.playground);
    }
  };

  // Quiz states
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { questionText: "", options: ["", ""], correctAnswer: "" },
  ]);

  // Sync Quiz Title with Chapter Title if empty
  useEffect(() => {
    if (!quizTitle && title) {
      setQuizTitle(`${title} Quiz`);
    }
  }, [title, quizTitle]);

  const addQuestion = () => {
    setQuestions([...questions, { questionText: "", options: ["", ""], correctAnswer: "" }]);
  };

  const removeQuestion = (qIndex: number) => {
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const updateQuestionText = (qIndex: number, text: string) => {
    setQuestions(questions.map((q, idx) => (idx === qIndex ? { ...q, questionText: text } : q)));
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    setQuestions(
      questions.map((q, idx) => {
        if (idx !== qIndex) return q;
        const newOptions = q.options.map((opt, oIdx) => (oIdx === oIndex ? text : opt));
        let newCorrectAnswer = q.correctAnswer;
        if (q.correctAnswer === q.options[oIndex]) {
          newCorrectAnswer = text;
        }
        return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
      }),
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions(
      questions.map((q, idx) => {
        if (idx !== qIndex) return q;
        return { ...q, options: [...q.options, ""] };
      }),
    );
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions(
      questions.map((q, idx) => {
        if (idx !== qIndex) return q;
        const optionToRemove = q.options[oIndex];
        const newOptions = q.options.filter((_, oIdx) => oIdx !== oIndex);
        let newCorrectAnswer = q.correctAnswer;
        if (q.correctAnswer === optionToRemove) {
          newCorrectAnswer = "";
        }
        return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
      }),
    );
  };

  const setCorrectAnswer = (qIndex: number, answer: string) => {
    setQuestions(questions.map((q, idx) => (idx === qIndex ? { ...q, correctAnswer: answer } : q)));
  };

  const isFormInvalid = () => {
    if (!title.trim()) return true;
    if (type === "VIDEO" && !videoUrl.trim()) return true;
    if (type === "DOCUMENT" && !documentUrl.trim()) return true;
    if (type === "PLAYGROUND" && (!pgId.trim() || !pgPlayground.trim() || !pgName.trim()))
      return true;
    if (type === "QUIZ") {
      const validQuestions = questions.filter((q) => q.questionText.trim());
      if (validQuestions.length === 0) return true;
      return questions.some((q) => {
        if (!q.questionText.trim()) return false;
        const filledOptions = q.options.map((o) => o.trim()).filter(Boolean);
        if (filledOptions.length < 2) return true;
        if (!q.correctAnswer.trim()) return true;
        if (!filledOptions.includes(q.correctAnswer.trim())) return true;
        return false;
      });
    }
    return false;
  };

  const handleSubmit = () => {
    if (isFormInvalid()) return;

    const payload: AddChapterForm = {
      title: title.trim(),
      description: description.trim(),
      type,
      sortOrder: sortOrder ? parseInt(sortOrder, 10) : undefined,
    };

    if (type === "VIDEO") {
      payload.videoUrl = videoUrl.trim() || null;
      payload.duration = duration ? parseInt(duration, 10) : null;
    } else if (type === "DOCUMENT") {
      payload.documentUrl = documentUrl.trim() || null;
    } else if (type === "PLAYGROUND") {
      payload.playgroundConfig = {
        pg: pgId.trim(),
        pgname: pgName.trim(),
        playground: pgPlayground.trim(),
        difficulty: pgDifficulty,
        maxScore: pgMaxScore ? parseInt(pgMaxScore, 10) : 100,
      };
    } else if (type === "QUIZ") {
      const finalQuizTitle = quizTitle.trim() || `${title.trim()} Quiz`;
      const formattedQuestions = questions
        .filter((q) => q.questionText.trim())
        .map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options.map((o) => o.trim()).filter(Boolean),
          correctAnswer: q.correctAnswer.trim(),
        }))
        .filter((q) => q.options.length >= 2 && q.correctAnswer);

      payload.quizzes = [
        {
          title: finalQuizTitle,
          questions: formattedQuestions,
        },
      ];
    }

    onAdd(payload);
  };

  return (
    <div className="mt-2 rounded-lg border border-dashed border-primary/20 bg-primary/5 p-3.5 space-y-4">
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
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Chapter description (optional)..."
        className="w-full rounded-md border border-[var(--hairline)] bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
      />

      <div className="flex items-center gap-2">
        {(["VIDEO", "DOCUMENT", "QUIZ", "PLAYGROUND"] as ChapterType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition ${
              type === t
                ? CHAPTER_TYPE_COLORS[t]
                : "border-[var(--hairline)] text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {}
      {type === "PLAYGROUND" && (
        <div className="space-y-4 bg-card/40 border border-[var(--hairline)] rounded-xl p-4 transition-all duration-300">
          <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
              <TerminalSquare className="h-4 w-4 text-purple-400" /> Playground Configuration
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Select Template Preset
              </label>
              <select
                value={pgTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition cursor-pointer"
              >
                {PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Difficulty Level
              </label>
              <select
                value={pgDifficulty}
                onChange={(e) =>
                  setPgDifficulty(e.target.value as "easy" | "medium" | "hard" | "expert")
                }
                className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition cursor-pointer"
              >
                <option value="easy">Easy (1.0x XP)</option>
                <option value="medium">Medium (1.5x XP)</option>
                <option value="hard">Hard (2.0x XP)</option>
                <option value="expert">Expert (3.0x XP)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Max Score / XP Points
              </label>
              <input
                type="number"
                min="0"
                value={pgMaxScore}
                onChange={(e) => setPgMaxScore(e.target.value)}
                placeholder="e.g. 100"
                className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--hairline)]">
            <button
              type="button"
              onClick={() => setShowAdvancedPg(!showAdvancedPg)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              {showAdvancedPg
                ? "Hide Advanced Settings"
                : "Show Advanced Settings (ZFS Parameters)"}
            </button>

            {showAdvancedPg && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-dashed border-[var(--hairline)]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Template Group ID (pg)
                  </label>
                  <input
                    type="text"
                    value={pgId}
                    onChange={(e) => setPgId(e.target.value)}
                    placeholder="Mongo ObjectId"
                    className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Template Name (pgname)
                  </label>
                  <input
                    type="text"
                    value={pgName}
                    onChange={(e) => setPgName(e.target.value)}
                    placeholder="e.g. UBUNTU2404"
                    className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    VM Template Slug
                  </label>
                  <input
                    type="text"
                    value={pgPlayground}
                    onChange={(e) => setPgPlayground(e.target.value)}
                    placeholder="e.g. ubuntu2404n1"
                    className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {type === "VIDEO" && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-card/40 border border-[var(--hairline)] rounded-xl p-4 transition-all duration-300">
          <div className="sm:col-span-8 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Video URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter Video URL like YouTube/Vimeo/S3"
                className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
              />
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
          </div>
          <div className="sm:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 10"
              className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
            />
          </div>
        </div>
      )}

      {type === "DOCUMENT" && (
        <div className="space-y-3 bg-card/40 border border-[var(--hairline)] rounded-xl p-4 transition-all duration-300">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">
            Document Attachment (.PDF)
          </label>

          <div
            onClick={() => document.getElementById("pdf-file-input")?.click()}
            className="border-2 border-dashed border-[var(--hairline)] hover:border-primary/40 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-background/20 hover:bg-background/40 transition group"
          >
            <input
              id="pdf-file-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFileName(file.name);
                  setIsUploading(true);
                  setUploadProgress(0);

                  let progress = 0;
                  const interval = setInterval(() => {
                    progress += 25;
                    setUploadProgress(progress);
                    if (progress >= 100) {
                      clearInterval(interval);
                      setIsUploading(false);
                      setDocumentUrl(`/uploads/lessons/${file.name}`);
                    }
                  }, 150);
                }
              }}
            />
            <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition" />
            <div className="text-center">
              <p className="text-xs font-medium text-foreground">
                {fileName ? fileName : "Click to select a PDF file"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">PDF documents up to 50MB</p>
            </div>

            {isUploading && (
              <div className="w-full mt-2">
                <div className="w-full bg-[var(--hairline)] rounded-full h-1">
                  <div
                    className="bg-[image:var(--gradient-primary)] h-1 rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
              Or paste PDF URL
            </span>
            <input
              type="text"
              value={documentUrl}
              onChange={(e) => {
                setDocumentUrl(e.target.value);
                if (e.target.value) {
                  setFileName("");
                }
              }}
              placeholder="https://..."
              className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
            />
          </div>
        </div>
      )}

      {type === "QUIZ" && (
        <div className="space-y-4 bg-card/40 border border-[var(--hairline)] rounded-xl p-4 transition-all duration-300">
          <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-emerald-400" /> Quiz Builder
            </h4>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Quiz Title
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g. Chapter Final Assessment"
              className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
            />
          </div>

          {}
          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="relative bg-card border border-[var(--hairline)] rounded-lg p-3.5 space-y-3"
              >
                {}
                <button
                  type="button"
                  onClick={() => removeQuestion(qIdx)}
                  className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Remove Question"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <div className="flex flex-col gap-1.5 pr-8">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                    Question {qIdx + 1}
                  </label>
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    placeholder="Enter question text here..."
                    className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
                  />
                </div>

                {}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Options & Correct Selection
                    </label>
                    <span className="text-[9px] text-muted-foreground">
                      Select radio to set correct answer
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        {}
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctAnswer !== "" && q.correctAnswer === opt}
                          disabled={!opt.trim()}
                          onChange={() => {
                            if (opt.trim()) {
                              setCorrectAnswer(qIdx, opt);
                            }
                          }}
                          className="h-3.5 w-3.5 text-primary border-[var(--hairline)] focus:ring-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title={opt.trim() ? "Mark as correct answer" : "Type option text first"}
                        />

                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                          className="flex-1 rounded-md border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                        />

                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIdx, oIdx)}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition"
                            title="Delete Option"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addOption(qIdx)}
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition mt-1"
                  >
                    <Plus className="h-3 w-3" /> Add Option
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-2 border border-dashed border-primary/30 rounded-lg text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Question
          </button>
        </div>
      )}

      {}
      <div className="flex gap-2 justify-end pt-2 border-t border-[var(--hairline)]">
        <button
          onClick={handleSubmit}
          disabled={isFormInvalid() || isUploading}
          className="inline-flex items-center gap-1 rounded-lg bg-[image:var(--gradient-primary)] px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-primary)] disabled:opacity-40 transition cursor-pointer"
        >
          <Check className="h-3.5 w-3.5" /> Add Lesson
        </button>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

function EditChapterPanel({
  chapter,
  onSave,
  onCancel,
}: {
  chapter: Chapter;
  onSave: (f: AddChapterForm) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(chapter.title);
  const [description, setDescription] = useState(chapter.description || "");
  const [type, setType] = useState<ChapterType>(chapter.type);
  const [sortOrder, setSortOrder] = useState(chapter.sortOrder?.toString() || "");

  // Video states
  const [videoUrl, setVideoUrl] = useState(chapter.videoUrl || "");
  const [duration, setDuration] = useState(chapter.duration?.toString() || "");

  // Document states
  const [documentUrl, setDocumentUrl] = useState(chapter.documentUrl || "");
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Playground states
  const pgConf = chapter.playgroundConfig;
  const initialPreset =
    PRESETS.find((p) => p.pg === pgConf?.pg && p.playground === pgConf?.playground)?.id || "1vmpg";

  const [pgTemplate, setPgTemplate] = useState(initialPreset);
  const [pgId, setPgId] = useState(pgConf?.pg || "6659f131a9de4f16462740bc");
  const [pgName, setPgName] = useState(pgConf?.pgname || "1VMPG");
  const [pgPlayground, setPgPlayground] = useState(pgConf?.playground || "ubuntu2404n1");
  const [pgDifficulty, setPgDifficulty] = useState<"easy" | "medium" | "hard" | "expert">(
    pgConf?.difficulty || "easy",
  );
  const [pgMaxScore, setPgMaxScore] = useState(pgConf?.maxScore?.toString() || "100");
  const [showAdvancedPg, setShowAdvancedPg] = useState(false);

  const handleTemplateChange = (presetId: string) => {
    setPgTemplate(presetId);
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setPgId(preset.pg);
      setPgName(preset.pgname);
      setPgPlayground(preset.playground);
    }
  };

  const isFormInvalid = () => {
    if (!title.trim()) return true;
    if (type === "VIDEO" && !videoUrl.trim()) return true;
    if (type === "DOCUMENT" && !documentUrl.trim()) return true;
    if (type === "PLAYGROUND" && (!pgId.trim() || !pgPlayground.trim() || !pgName.trim()))
      return true;
    return false;
  };

  const handleSubmit = () => {
    if (isFormInvalid()) return;

    const payload: AddChapterForm = {
      title: title.trim(),
      description: description.trim(),
      type,
      sortOrder: sortOrder ? parseInt(sortOrder, 10) : undefined,
    };

    if (type === "VIDEO") {
      payload.videoUrl = videoUrl.trim() || null;
      payload.duration = duration ? parseInt(duration, 10) : null;
    } else if (type === "DOCUMENT") {
      payload.documentUrl = documentUrl.trim() || null;
    } else if (type === "PLAYGROUND") {
      payload.playgroundConfig = {
        pg: pgId.trim(),
        pgname: pgName.trim(),
        playground: pgPlayground.trim(),
        difficulty: pgDifficulty,
        maxScore: pgMaxScore ? parseInt(pgMaxScore, 10) : 100,
      };
    }

    onSave(payload);
  };

  return (
    <div className="w-full rounded-lg border border-[var(--hairline)] bg-card p-3.5 space-y-4 text-left">
      <div className="flex justify-between items-center border-b border-[var(--hairline)] pb-2 mb-2">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Edit3 className="h-4 w-4 text-primary" /> Edit Lesson Details
        </h4>
      </div>

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
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Chapter description (optional)..."
        className="w-full rounded-md border border-[var(--hairline)] bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
      />

      <div className="flex items-center gap-2">
        {(["VIDEO", "DOCUMENT", "QUIZ", "PLAYGROUND"] as ChapterType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition ${
              type === t
                ? CHAPTER_TYPE_COLORS[t]
                : "border-[var(--hairline)] text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {}
      {type === "PLAYGROUND" && (
        <div className="space-y-4 bg-card/40 border border-[var(--hairline)] rounded-xl p-4 transition-all duration-300">
          <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
              <TerminalSquare className="h-4 w-4 text-purple-400" /> Playground Configuration
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Select Template Preset
              </label>
              <select
                value={pgTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition cursor-pointer"
              >
                {PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Difficulty Level
              </label>
              <select
                value={pgDifficulty}
                onChange={(e) =>
                  setPgDifficulty(e.target.value as "easy" | "medium" | "hard" | "expert")
                }
                className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition cursor-pointer"
              >
                <option value="easy">Easy (1.0x XP)</option>
                <option value="medium">Medium (1.5x XP)</option>
                <option value="hard">Hard (2.0x XP)</option>
                <option value="expert">Expert (3.0x XP)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Max Score / XP Points
              </label>
              <input
                type="number"
                min="0"
                value={pgMaxScore}
                onChange={(e) => setPgMaxScore(e.target.value)}
                placeholder="e.g. 100"
                className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--hairline)]">
            <button
              type="button"
              onClick={() => setShowAdvancedPg(!showAdvancedPg)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              {showAdvancedPg
                ? "Hide Advanced Settings"
                : "Show Advanced Settings (ZFS Parameters)"}
            </button>

            {showAdvancedPg && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-dashed border-[var(--hairline)]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Template Group ID (pg)
                  </label>
                  <input
                    type="text"
                    value={pgId}
                    onChange={(e) => setPgId(e.target.value)}
                    placeholder="Mongo ObjectId"
                    className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Template Name (pgname)
                  </label>
                  <input
                    type="text"
                    value={pgName}
                    onChange={(e) => setPgName(e.target.value)}
                    placeholder="e.g. UBUNTU2404"
                    className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    VM Template Slug
                  </label>
                  <input
                    type="text"
                    value={pgPlayground}
                    onChange={(e) => setPgPlayground(e.target.value)}
                    placeholder="e.g. ubuntu2404n1"
                    className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {type === "VIDEO" && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[var(--surface-2,var(--card))] border border-[var(--hairline)] rounded-xl p-4 transition-all duration-300">
          <div className="sm:col-span-8 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Video URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter Video URL like YouTube/Vimeo/S3"
                className="w-full rounded-lg border border-[var(--hairline)] bg-card pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
              />
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
          </div>
          <div className="sm:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 10"
              className="w-full rounded-lg border border-[var(--hairline)] bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
            />
          </div>
        </div>
      )}

      {type === "DOCUMENT" && (
        <div className="space-y-3 bg-[var(--surface-2,var(--card))] border border-[var(--hairline)] rounded-xl p-4 transition-all duration-300">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">
            Document Attachment (.PDF)
          </label>

          <div
            onClick={() => document.getElementById(`pdf-file-edit-input-${chapter.id}`)?.click()}
            className="border-2 border-dashed border-[var(--hairline)] hover:border-primary/40 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-background/20 hover:bg-background/40 transition group"
          >
            <input
              id={`pdf-file-edit-input-${chapter.id}`}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFileName(file.name);
                  setIsUploading(true);
                  setUploadProgress(0);

                  let progress = 0;
                  const interval = setInterval(() => {
                    progress += 25;
                    setUploadProgress(progress);
                    if (progress >= 100) {
                      clearInterval(interval);
                      setIsUploading(false);
                      setDocumentUrl(`/uploads/lessons/${file.name}`);
                    }
                  }, 150);
                }
              }}
            />
            <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition" />
            <div className="text-center">
              <p className="text-xs font-medium text-foreground">
                {fileName ? fileName : "Click to select a PDF file"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">PDF documents up to 50MB</p>
            </div>

            {isUploading && (
              <div className="w-full mt-2">
                <div className="w-full bg-[var(--hairline)] rounded-full h-1">
                  <div
                    className="bg-[image:var(--gradient-primary)] h-1 rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
              Or paste PDF URL
            </span>
            <input
              type="text"
              value={documentUrl}
              onChange={(e) => {
                setDocumentUrl(e.target.value);
                if (e.target.value) {
                  setFileName("");
                }
              }}
              placeholder="https://..."
              className="w-full rounded-lg border border-[var(--hairline)] bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
            />
          </div>
        </div>
      )}

      {type === "QUIZ" && (
        <div className="p-4 bg-[var(--surface-2,var(--card))] border border-[var(--hairline)] rounded-xl text-center">
          <HelpCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Quiz questions can be managed when creating the quiz. Use this form to update the Quiz
            Chapter title and ordering.
          </p>
        </div>
      )}

      {}
      <div className="flex gap-2 justify-end pt-2 border-t border-[var(--hairline)]">
        <button
          onClick={handleSubmit}
          disabled={isFormInvalid() || isUploading}
          className="inline-flex items-center gap-1 rounded-lg bg-[image:var(--gradient-primary)] px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-primary)] disabled:opacity-40 transition cursor-pointer"
        >
          <Check className="h-3.5 w-3.5" /> Save Changes
        </button>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

function ChapterRow({
  chapter,
  index,
  moduleId,
  onDelete,
  onUpdate,
  onReorderChapters,
  onDragStartActive,
}: {
  chapter: Chapter;
  index: number;
  moduleId: string;
  onDelete: () => void;
  onUpdate: (f: AddChapterForm) => void;
  onReorderChapters: (fromIdx: number, toIdx: number) => void;
  onDragStartActive: () => void;
}) {
  const [dragEnabled, setDragEnabled] = useState(false);
  const [isDragPreview, setIsDragPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <EditChapterPanel
        chapter={chapter}
        onSave={(f) => {
          onUpdate(f);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

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
      <span className="flex-1 text-foreground/90 font-medium truncate flex flex-col justify-center">
        <span>
          {index + 1}. {chapter.title}
        </span>
        {chapter.description && (
          <span className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">
            {chapter.description}
          </span>
        )}
      </span>
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${CHAPTER_TYPE_COLORS[chapter.type]}`}
      >
        {chapter.type}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition cursor-pointer"
        aria-label={`Edit ${chapter.title}`}
      >
        <Edit3 className="h-3.5 w-3.5" />
      </button>
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

function ModuleRow({
  module,
  index,
  onDeleteChapter,
  onAddChapter,
  onUpdateChapter,
  onUpdateTitle,
  onReorderChapters,
  onReorderModules,
  isOpen,
  onToggle,
  onDragStartActive,
}: {
  module: Module;
  index: number;
  onDeleteChapter: (chapterId: string) => void;
  onAddChapter: (moduleId: string, form: AddChapterForm) => void;
  onUpdateChapter: (moduleId: string, chapterId: string, form: AddChapterForm) => void;
  onUpdateTitle: (moduleId: string, title: string) => void;
  onReorderChapters: (fromIdx: number, toIdx: number) => void;
  onReorderModules: (fromIdx: number, toIdx: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  onDragStartActive: () => void;
}) {
  const [addingChapter, setAddingChapter] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [isDragPreview, setIsDragPreview] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(module.title);

  const [draggedChapterIndex, setDraggedChapterIndex] = useState<number | null>(null);
  const [dragOverChapterIndex, setDragOverChapterIndex] = useState<number | null>(null);

  const sortedChapters = [...(module.chapters ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    setEditedTitle(module.title);
  }, [module.title]);

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
      className={`rounded-xl border border-[var(--hairline)] overflow-hidden transition-all duration-300 ease-out group/module ${
        isDragPreview
          ? "bg-white/10 backdrop-blur-md border-white/30 shadow-[0_8px_32px_rgba(255,255,255,0.15)] opacity-95 scale-[1.02] rotate-1"
          : "bg-card"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--hairline)] bg-card/80 group/mod-header">
        <GripVertical
          className="h-5 w-5 text-muted-foreground/40 cursor-grab shrink-0"
          onMouseDown={() => setDragEnabled(true)}
          onMouseUp={() => setDragEnabled(false)}
        />

        {isEditingTitle ? (
          <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="flex-1 rounded border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-2 py-1 text-xs text-foreground focus:outline-none"
            />
            <button
              onClick={async () => {
                if (editedTitle.trim() && editedTitle.trim() !== module.title) {
                  await onUpdateTitle(module.id, editedTitle.trim());
                }
                setIsEditingTitle(false);
              }}
              className="p-1 rounded hover:bg-emerald-500/10 text-emerald-400 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setEditedTitle(module.title);
                setIsEditingTitle(false);
              }}
              className="p-1 rounded hover:bg-red-500/10 text-red-400 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-w-0">
            <span className="font-semibold text-foreground text-sm flex items-center gap-2">
              {index + 1}. {module.title}
              <button
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover/mod-header:opacity-100 p-0.5 rounded text-muted-foreground hover:text-foreground transition cursor-pointer"
                title="Edit Module Title"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </span>
            {module.description && (
              <span className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">
                {module.description}
              </span>
            )}
          </div>
        )}

        <span className="text-xs text-muted-foreground">{sortedChapters.length} chapters</span>
        <button
          onClick={() => setAddingChapter(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hairline)] bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition cursor-pointer"
        >
          <Plus className="h-3 w-3" /> Add Lesson
        </button>
        <button
          onClick={onToggle}
          className="p-1 text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
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
                    onUpdate={(f) => onUpdateChapter(module.id, ch.id, f)}
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
            <p className="text-xs text-muted-foreground text-center py-4">
              No chapters yet. Add one below.
            </p>
          )}
          {addingChapter ? (
            <AddChapterPanel
              onAdd={(f) => {
                onAddChapter(module.id, f);
                setAddingChapter(false);
              }}
              onCancel={() => setAddingChapter(false)}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function CurriculumPanel({
  modules,
  onAddModule,
  onAddChapter,
  onUpdateChapter,
  onDeleteChapter,
  onUpdateModuleTitle,
  onReorderModules,
  onReorderChapters,
}: {
  modules: Module[];
  onAddModule: (f: AddModuleForm) => void;
  onAddChapter: (moduleId: string, form: AddChapterForm) => void;
  onUpdateChapter: (moduleId: string, chapterId: string, form: AddChapterForm) => void;
  onDeleteChapter: (moduleId: string, chapterId: string) => void;
  onUpdateModuleTitle: (moduleId: string, title: string) => void;
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
            {allExpanded ? (
              <ChevronsDownUp className="h-4 w-4" />
            ) : (
              <ChevronsUpDown className="h-4 w-4" />
            )}
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
              onUpdateChapter={onUpdateChapter}
              onUpdateTitle={onUpdateModuleTitle}
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
            onAdd={(f) => {
              onAddModule(f);
              setAddingModule(false);
            }}
            onCancel={() => setAddingModule(false)}
          />
        )}
      </div>
    </SectionCard>
  );
}

function EditDetailsTab({
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
        <label
          htmlFor="edit-instructor"
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
        >
          Assign Instructor
        </label>
        <select
          id="edit-instructor"
          value={instructorId}
          disabled={isInstructor}
          onChange={(e) => setInstructorId(e.target.value)}
          className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2.5 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <option value="">— Unassigned —</option>
          {instructors.map((ins) => (
            <option key={ins.id} value={ins.id}>
              {ins.name} · {ins.designation}
            </option>
          ))}
        </select>
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

interface EnrolledStudentItem {
  id: string;
  purchasedAt: string;
  student?: {
    name?: string | null;
    email: string;
  } | null;
}

function EnrolledStudentsTab({ courseId }: { courseId: string }) {
  const [students, setStudents] = useState<
    { id: string; name: string; email: string; purchasedAt: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    managementService
      .getEnrolledStudents(courseId)
      .then((data: EnrolledStudentItem[]) => {
        if (!active) return;
        const mapped = data.map((item) => ({
          id: item.id,
          name: item.student?.name || "Unknown Student",
          email: item.student?.email || "",
          purchasedAt: item.purchasedAt,
        }));
        setStudents(mapped);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load enrolled students:", err);
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <span className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin animate-infinite" />
        <p className="text-xs text-muted-foreground mt-2">Loading enrolled students...</p>
      </div>
    );
  }

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
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-lg border border-[var(--hairline)] bg-background/40 px-3 py-3"
            >
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

function ConfigPanel({
  course,
  instructors,
  onSaveInstructor,
}: {
  course: Course;
  instructors: Instructor[];
  onSaveInstructor: (instructorId: string | null) => Promise<void>;
}) {
  const [tab, setTab] = useState<"details" | "students">("details");

  return (
    <SectionCard>
      <div className="flex gap-6 px-5 border-b border-[var(--hairline)]">
        <TabButton
          label="Edit Details & Instructor"
          active={tab === "details"}
          onClick={() => setTab("details")}
        />
        <TabButton
          label={`Enrolled Students (${course.totalStudents})`}
          active={tab === "students"}
          onClick={() => setTab("students")}
        />
      </div>

      {tab === "details" && (
        <EditDetailsTab
          course={course}
          instructors={instructors}
          onSaveInstructor={onSaveInstructor}
        />
      )}
      {tab === "students" && <EnrolledStudentsTab courseId={course.id} />}
    </SectionCard>
  );
}

export function CourseManagementDashboard({ slug }: { slug: string }) {
  const { data: course, isLoading, isError, refetch } = useCourse(slug);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
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
    if (user?.role !== "INSTRUCTOR") {
      managementService.getInstructors().then(setInstructors);
    }
  }, [user]);

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
            onSaveInstructor={handleSaveInstructor}
          />
        </div>
      </div>
    </main>
  );
}
