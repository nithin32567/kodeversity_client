import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2, Video, FileText, HelpCircle, BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle, ChevronsUpDown, ChevronsDownUp, Upload, TerminalSquare, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { User } from "@/domain/user";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";

export function SearchableInstructorSelect({
  instructors,
  value,
  onChange,
  disabled,
}: {
  instructors: Instructor[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = instructors.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.designation?.toLowerCase().includes(search.toLowerCase())
  );

  const selected = instructors.find((i) => i.id === value);

  return (
    <div className="relative">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2.5 text-sm text-foreground focus:border-primary/60 focus:outline-none transition ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="truncate">
          {selected ? `${selected.name} · ${selected.designation}` : "— Unassigned —"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-[var(--surface)] border border-[var(--hairline)] rounded-lg shadow-xl max-h-60 flex flex-col">
            <div className="p-2 border-b border-[var(--hairline)]">
              <input
                autoFocus
                type="text"
                placeholder="Search instructors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--hairline)] rounded-md px-3 py-1.5 text-xs focus:outline-none text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="overflow-y-auto flex-1 p-1">
              <div
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`px-3 py-2 text-xs rounded-md cursor-pointer hover:bg-[var(--surface-2)] ${!value ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                — Unassigned —
              </div>
              {filtered.map((ins) => (
                <div
                  key={ins.id}
                  onClick={() => {
                    onChange(ins.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-3 py-2 text-xs rounded-md cursor-pointer hover:bg-[var(--surface-2)] ${value === ins.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <div className="font-semibold text-foreground">{ins.name}</div>
                  <div className="text-[10px] text-muted-foreground/70">{ins.designation}</div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center">No instructors found.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}