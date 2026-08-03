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
import { CHAPTER_TYPE_COLORS } from '../utils';
import { ChapterIcon } from './ui';
import { EditChapterPanel } from './EditChapterPanel';
export function ChapterRow({
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