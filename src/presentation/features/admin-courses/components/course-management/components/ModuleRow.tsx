import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2, Video, FileText, HelpCircle, BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle, ChevronsUpDown, ChevronsDownUp, Upload, TerminalSquare, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { User } from "@/domain/user";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";

import { AddChapterForm } from '../types';
import { ChapterRow } from './ChapterRow';
import { AddChapterPanel } from './AddChapterPanel';
export function ModuleRow({
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