import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2, Video, FileText, HelpCircle, BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle, ChevronsUpDown, ChevronsDownUp, Upload, TerminalSquare, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { User } from "@/domain/user";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";

import { LEVEL_OPTIONS, CHAPTER_TYPE_COLORS } from '../utils';
export function ChapterIcon({ type }: { type: ChapterType }) {
  if (type === "VIDEO") return <Video className="h-3.5 w-3.5 shrink-0 text-blue-400" />;
  if (type === "DOCUMENT") return <FileText className="h-3.5 w-3.5 shrink-0 text-amber-400" />;
  if (type === "PLAYGROUND")
    return <TerminalSquare className="h-3.5 w-3.5 shrink-0 text-purple-400" />;
  return <HelpCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />;
}
export function SectionCard({
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

export function TabButton({
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

export function InputField({
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