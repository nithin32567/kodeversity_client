import React, { useEffect, useRef, useState } from "react";
import {
  Gauge,
  Repeat,
  AlertTriangle,
  FileText,
  Highlighter,
  Sparkles,
  Edit,
  BarChart3,
  Check,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

export type ContextType = "video" | "lesson-content" | "default";

interface CustomContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  contextType: ContextType;
  selectedText: string;
  onClose: () => void;
  isAdmin: boolean;

  // Video Controls
  playbackRate?: number;
  setPlaybackRate?: (rate: number) => void;
  loopVideo?: boolean;
  toggleLoopVideo?: () => void;
  onReportVideoIssue?: () => void;

  // Content Controls
  onTakeNote?: (text: string) => void;
  onHighlightText?: (color: string, text: string) => void;
  onAskAI?: (text: string) => void;

  // Instructor/Admin Controls
  onEditLesson?: () => void;
  onViewAnalytics?: () => void;
}

const HIGHLIGHT_COLORS = [
  {
    name: "Yellow",
    class: "bg-yellow-400/80 shadow-[0_0_8px_rgba(250,204,21,0.5)]",
    value: "#facc15",
  },
  {
    name: "Green",
    class: "bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    value: "#34d399",
  },
  {
    name: "Pink",
    class: "bg-pink-400/80 shadow-[0_0_8px_rgba(244,114,182,0.5)]",
    value: "#f472b6",
  },
  { name: "Blue", class: "bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.5)]", value: "#22d3ee" },
  {
    name: "Purple",
    class: "bg-purple-400/80 shadow-[0_0_8px_rgba(192,132,252,0.5)]",
    value: "#c084fc",
  },
];

const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2];

export function CustomContextMenu({
  isOpen,
  x,
  y,
  contextType,
  selectedText,
  onClose,
  isAdmin,
  playbackRate = 1,
  setPlaybackRate,
  loopVideo = false,
  toggleLoopVideo,
  onReportVideoIssue,
  onTakeNote,
  onHighlightText,
  onAskAI,
  onEditLesson,
  onViewAnalytics,
}: CustomContextMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState({ x, y });
  const [submenuLeft, setSubmenuLeft] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Wait for DOM layout
    const timer = setTimeout(() => {
      const menuWidth = containerRef.current?.offsetWidth || 220;
      const menuHeight = containerRef.current?.offsetHeight || 300;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let newX = x;
      let newY = y;

      // Prevent horizontal overflow
      if (x + menuWidth > screenWidth) {
        newX = x - menuWidth;
      }
      // Prevent vertical overflow
      if (y + menuHeight > screenHeight) {
        newY = y - menuHeight;
      }

      // Check if submenu will overflow on the right
      if (newX + menuWidth + 140 > screenWidth) {
        setSubmenuLeft(true);
      } else {
        setSubmenuLeft(false);
      }

      setAdjustedPos({
        x: Math.max(0, newX),
        y: Math.max(0, newY),
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [x, y, isOpen]);

  if (!isOpen) return null;

  const itemClass =
    "flex w-full items-center px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-primary/20 active:bg-primary/30 transition-all duration-150 rounded-lg cursor-pointer text-left";

  const handleAction = (callback?: () => void, label?: string) => {
    if (callback) {
      callback();
    } else if (label) {
      toast.info(`${label} action triggered`);
    }
    onClose();
  };

  const handleHighlight = (color: string) => {
    if (onHighlightText) {
      onHighlightText(color, selectedText);
    } else {
      toast.success(`Text highlighted in ${color}`);
    }
    onClose();
  };

  return (
    <div
      ref={containerRef}
      role="menu"
      aria-label="Custom Context Menu"
      className="fixed bg-[#07060f]/98 border border-white/10 backdrop-blur-md rounded-xl p-1.5 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8),_0_0_15px_rgba(255,255,255,0.02)] z-[9999] min-w-[220px]"
      style={{
        left: `${adjustedPos.x}px`,
        top: `${adjustedPos.y}px`,
      }}
      onContextMenu={(e) => {
        // Prevent default on our custom context menu itself
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        // Prevent click events from propagating to window click handler
        e.stopPropagation();
      }}
    >
      {/* ── VIDEO PLAYER CONTEXT ── */}
      {contextType === "video" && (
        <div className="space-y-0.5">
          <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
            Video Player
          </div>

          {/* Playback Speed (with submenu) */}
          <div className="relative group">
            <div
              className={`flex w-full items-center justify-between px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-primary/20 active:bg-primary/30 transition-all duration-150 rounded-lg cursor-pointer`}
            >
              <span className="flex items-center">
                <Gauge className="w-3.5 h-3.5 mr-2 text-primary" />
                Playback Speed
              </span>
              <span className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {playbackRate}x
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </div>

            {/* Submenu */}
            <div
              className={`absolute top-0 hidden group-hover:block bg-[#07060f]/98 border border-white/10 backdrop-blur-md rounded-xl p-1.5 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8)] z-[10000] min-w-[120px] space-y-0.5 ${
                submenuLeft ? "right-full mr-1.5" : "left-full ml-1.5"
              }`}
            >
              {PLAYBACK_SPEEDS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    if (setPlaybackRate) setPlaybackRate(speed);
                    toast.success(`Speed set to ${speed}x`);
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-all duration-150 cursor-pointer ${
                    playbackRate === speed
                      ? "text-primary bg-primary/10 font-medium"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{speed === 1 ? "1.0x (Normal)" : `${speed}x`}</span>
                  {playbackRate === speed && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Loop Video */}
          <button
            onClick={() => {
              if (toggleLoopVideo) toggleLoopVideo();
              toast.success(`Video loop ${!loopVideo ? "enabled" : "disabled"}`);
              onClose();
            }}
            className={itemClass}
          >
            <Repeat className="w-3.5 h-3.5 mr-2 text-primary" />
            <span className="flex-1">Loop Video</span>
            {loopVideo && <Check className="w-3.5 h-3.5 text-primary" />}
          </button>

          {/* Report Video Issue */}
          <button
            onClick={() => handleAction(onReportVideoIssue, "Report Video Issue")}
            className={itemClass}
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-2 text-amber-500" />
            Report Video Issue
          </button>
        </div>
      )}

      {/* ── LESSON TEXT / CONTENT CONTEXT ── */}
      {contextType === "lesson-content" && (
        <div className="space-y-0.5">
          <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
            Lesson Actions
          </div>

          {/* Highlight options */}
          <div className="px-3 py-1 text-[11px] text-muted-foreground select-none">
            🖍️ Highlight
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 border-b border-white/5 mb-1.5 justify-between">
            {HIGHLIGHT_COLORS.map((col) => (
              <button
                key={col.name}
                title={`Highlight ${col.name}`}
                onClick={() => handleHighlight(col.value)}
                className={`w-5 h-5 rounded-full ${col.class} hover:scale-125 transition-transform duration-150 cursor-pointer`}
              />
            ))}
          </div>

          {/* Take a Note */}
          <button
            onClick={() => {
              if (onTakeNote) {
                onTakeNote(selectedText);
              } else {
                toast.success(
                  selectedText ? "Note taken from selected text" : "Notes panel opened",
                );
              }
              onClose();
            }}
            className={itemClass}
          >
            <FileText className="w-3.5 h-3.5 mr-2 text-emerald-400" />
            Take a Note
          </button>

          {/* Ask AI / Doubt Clearance */}
          <button
            onClick={() => {
              if (onAskAI) {
                onAskAI(selectedText);
              } else {
                toast.success(
                  selectedText
                    ? `Sent selection to AI: "${selectedText.slice(0, 20)}..."`
                    : "Ask AI workspace opened",
                );
              }
              onClose();
            }}
            className={itemClass}
          >
            <Sparkles className="w-3.5 h-3.5 mr-2 text-purple-400 animate-pulse" />
            Ask AI Assistant
          </button>
        </div>
      )}

      {/* ── DEFAULT / FALLBACK CONTEXT ── */}
      {contextType === "default" && (
        <div className="space-y-0.5">
          <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
            LMS Workspace
          </div>

          <button
            onClick={() => handleAction(() => window.location.reload(), "Reload")}
            className={itemClass}
          >
            <Repeat className="w-3.5 h-3.5 mr-2 text-primary" />
            Refresh Workspace
          </button>

          {selectedText && (
            <>
              <button
                onClick={() => {
                  if (onAskAI) onAskAI(selectedText);
                  else toast.success(`Asking AI about: "${selectedText.slice(0, 20)}..."`);
                  onClose();
                }}
                className={itemClass}
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 text-purple-400" />
                Ask AI about "{selectedText.slice(0, 15)}..."
              </button>

              <button
                onClick={() => {
                  if (onTakeNote) onTakeNote(selectedText);
                  else toast.success("Copied to notes");
                  onClose();
                }}
                className={itemClass}
              >
                <ClipboardList className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                Create Note from Text
              </button>
            </>
          )}
        </div>
      )}

      {/* ── INSTRUCTOR / ADMIN SECTION (BOTTOM) ── */}
      {isAdmin && (
        <>
          <div className="my-1 border-t border-white/10" />
          <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
            Instructor Controls
          </div>

          {/* Edit Lesson */}
          <button
            onClick={() => handleAction(onEditLesson, "Edit This Lesson")}
            className={itemClass}
          >
            <Edit className="w-3.5 h-3.5 mr-2 text-cyan-400" />
            Edit This Lesson
          </button>

          {/* View Analytics */}
          <button
            onClick={() => handleAction(onViewAnalytics, "View Analytics")}
            className={itemClass}
          >
            <BarChart3 className="w-3.5 h-3.5 mr-2 text-pink-400" />
            View Analytics
          </button>
        </>
      )}
    </div>
  );
}
