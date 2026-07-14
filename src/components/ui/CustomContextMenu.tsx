import { useState } from "react";
import { useContextMenu } from "@/hooks/useContextMenu";
import {
  Play,
  Repeat,
  Flag,
  PenTool,
  Highlighter,
  Sparkles,
  Edit,
  BarChart,
  ChevronRight,
} from "lucide-react";

interface CustomContextMenuProps {
  isAdmin?: boolean;
}

export function CustomContextMenu({ isAdmin = false }: CustomContextMenuProps) {
  const { x, y, isToggled, contextType, closeMenu } = useContextMenu();
  const [speedHovered, setSpeedHovered] = useState(false);
  const [loopToggled, setLoopToggled] = useState(false);

  if (!isToggled) return null;

  return (
    <div
      className="fixed z-50 min-w-[220px] rounded-xl border border-white/10 bg-[#07060f]/95 p-1.5 shadow-2xl backdrop-blur-xl transition-opacity duration-200"
      style={{
        top: y,
        left: x,
        animation: "fadeIn 0.15s ease-out",
      }}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex flex-col space-y-0.5 text-sm text-gray-200">
        {contextType === "video" && (
          <>
            <div
              className="relative group"
              onMouseEnter={() => setSpeedHovered(true)}
              onMouseLeave={() => setSpeedHovered(false)}
            >
              <button className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-white/10 hover:text-white transition-colors">
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4" /> Playback Speed
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {speedHovered && (
                <div className="absolute left-full top-0 ml-1.5 min-w-[120px] rounded-lg border border-white/10 bg-[#07060f]/95 p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                  {["0.5x", "1x", "1.5x", "2x"].map((speed) => (
                    <button
                      key={speed}
                      className="flex w-full items-center px-3 py-1.5 rounded-md hover:bg-white/10 hover:text-white transition-colors text-sm"
                      onClick={() => {
                        console.log("Speed set to", speed);
                        closeMenu();
                      }}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => {
                setLoopToggled(!loopToggled);
                closeMenu();
              }}
            >
              <span className="flex items-center gap-2">
                <Repeat className="h-4 w-4" /> Loop Video
              </span>
              {loopToggled && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            </button>
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors"
              onClick={closeMenu}
            >
              <Flag className="h-4 w-4" /> Report Video Issue
            </button>
          </>
        )}

        {contextType === "text" && (
          <>
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-white/10 hover:text-white transition-colors"
              onClick={closeMenu}
            >
              <PenTool className="h-4 w-4" /> Take a Note
            </button>
            <div className="flex w-full items-center justify-between rounded-md px-3 py-2 hover:bg-white/10 transition-colors group">
              <span className="flex items-center gap-2">
                <Highlighter className="h-4 w-4" /> Highlight
              </span>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={closeMenu}
                  className="h-3 w-3 rounded-full bg-yellow-400 hover:scale-125 transition-transform"
                />
                <button
                  onClick={closeMenu}
                  className="h-3 w-3 rounded-full bg-green-400 hover:scale-125 transition-transform"
                />
                <button
                  onClick={closeMenu}
                  className="h-3 w-3 rounded-full bg-blue-400 hover:scale-125 transition-transform"
                />
                <button
                  onClick={closeMenu}
                  className="h-3 w-3 rounded-full bg-pink-400 hover:scale-125 transition-transform"
                />
              </div>
            </div>
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 transition-colors"
              onClick={closeMenu}
            >
              <Sparkles className="h-4 w-4" /> Ask AI
            </button>
          </>
        )}

        {contextType === "default" && (
          <div className="px-3 py-2 text-xs text-muted-foreground italic">Kodeversity LMS</div>
        )}

        {isAdmin && (
          <>
            <div className="my-1 h-px bg-white/10" />
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Admin Actions
            </div>
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-white/10 hover:text-white transition-colors"
              onClick={closeMenu}
            >
              <Edit className="h-4 w-4 text-emerald-400" /> Edit This Lesson
            </button>
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-white/10 hover:text-white transition-colors"
              onClick={closeMenu}
            >
              <BarChart className="h-4 w-4 text-sky-400" /> View Analytics
            </button>
          </>
        )}
      </div>
    </div>
  );
}
