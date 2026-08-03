import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2, Video, FileText, HelpCircle, BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle, ChevronsUpDown, ChevronsDownUp, Upload, TerminalSquare, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { User } from "@/domain/user";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";

import { AddModuleForm, AddChapterForm } from '../types';
import { SectionCard } from './ui';
import { ModuleRow } from './ModuleRow';
import { AddModulePanel } from './AddModulePanel';
export function CurriculumPanel({
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