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
export function EditChapterPanel({
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
  const [language, setLanguage] = useState(pgConf?.language || "python");
  const [problemDescription, setProblemDescription] = useState(pgConf?.problemDescription || "");
  const [starterCode, setStarterCode] = useState(pgConf?.starterCode || "");
  const [hints, setHints] = useState<string[]>(pgConf?.hints || []);
  const [hintInput, setHintInput] = useState("");

  const isFormInvalid = () => {
    if (!title.trim()) return true;
    if (type === "VIDEO" && !videoUrl.trim()) return true;
    if (type === "DOCUMENT" && !documentUrl.trim()) return true;
    if (type === "PLAYGROUND" && (!language.trim() || !problemDescription.trim()))
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
        language: language.trim(),
        problemDescription: problemDescription.trim(),
        starterCode: starterCode.trim(),
        hints,
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
              <TerminalSquare className="h-4 w-4 text-purple-400" /> Coding Playground Configuration
            </h4>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition cursor-pointer"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="go">Go</option>
              <option value="csharp">C#</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Problem Statement
            </label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              rows={4}
              placeholder="Describe the problem here (HTML/Markdown allowed)..."
              className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Starter Code
            </label>
            <textarea
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              rows={4}
              placeholder="Initial code for the editor (e.g. export function signature)..."
              className="w-full rounded-lg border border-[var(--hairline)] bg-[#1e1e1e] font-mono text-gray-300 px-3 py-2 text-xs focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Hints
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hintInput}
                onChange={(e) => setHintInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (hintInput.trim()) {
                      setHints([...hints, hintInput.trim()]);
                      setHintInput("");
                    }
                  }
                }}
                placeholder="Type a hint and press Enter"
                className="flex-1 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2,var(--card))] px-3 py-2 text-xs text-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
              />
              <button
                type="button"
                onClick={() => {
                  if (hintInput.trim()) {
                    setHints([...hints, hintInput.trim()]);
                    setHintInput("");
                  }
                }}
                className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                Add Hint
              </button>
            </div>
            {hints.length > 0 && (
              <div className="mt-2 space-y-2">
                {hints.map((hint, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[var(--surface-2)] p-2 rounded-md text-xs border border-[var(--hairline)]">
                    <span className="text-muted-foreground truncate flex-1 mr-2">{hint}</span>
                    <button type="button" onClick={() => setHints(hints.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
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