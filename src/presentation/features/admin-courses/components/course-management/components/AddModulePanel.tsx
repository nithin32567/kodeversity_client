import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2, Video, FileText, HelpCircle, BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle, ChevronsUpDown, ChevronsDownUp, Upload, TerminalSquare, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { User } from "@/domain/user";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";

import { AddModuleForm } from '../types';
// ─── Inline "Add Module" Form ─────────────────────────────────────────────────

export function AddModulePanel({
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