import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2, Video, FileText, HelpCircle, BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle, ChevronsUpDown, ChevronsDownUp, Upload, TerminalSquare, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { User } from "@/domain/user";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";

export const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "BEGINNER_TO_ADVANCED", label: "Beginner to Advanced" },
];

export const CHAPTER_TYPE_COLORS: Record<ChapterType, string> = {
  VIDEO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DOCUMENT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  QUIZ: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PLAYGROUND: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};
export function handleModuleReorder(modules: Module[], fromIdx: number, toIdx: number): Module[] {
  const list = [...modules];
  const [moved] = list.splice(fromIdx, 1);
  list.splice(toIdx, 0, moved);
  return list.map((m, i) => ({ ...m, sortOrder: i }));
}

export function handleChapterReorder(chapters: Chapter[], fromIdx: number, toIdx: number): Chapter[] {
  const list = [...chapters];
  const [moved] = list.splice(fromIdx, 1);
  list.splice(toIdx, 0, moved);
  return list.map((c, i) => ({ ...c, sortOrder: i }));
}