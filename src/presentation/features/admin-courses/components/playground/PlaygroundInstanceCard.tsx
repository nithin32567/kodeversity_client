import { Terminal, Clock } from "lucide-react";
import type { ActivePlayground } from "./types";

interface PlaygroundInstanceCardProps {
  pg: ActivePlayground;
  onInspect: (id: string, postName: string, type: string) => void;
}

export function PlaygroundInstanceCard({ pg, onInspect }: PlaygroundInstanceCardProps) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface-2)]/20 p-5 shadow-sm transition-all">
      <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              pg.status === "active" ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <h3 className="font-bold text-sm text-foreground">{pg.post_name || "Provisioning..."}</h3>
        </div>
        <div className="flex items-center gap-2">
          {pg.status === "active" && pg.post_name && (
            <button
              onClick={() => onInspect(pg._id, pg.post_name!, pg.type || "")}
              className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors border border-indigo-500/20"
              title="Open Terminal"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider bg-white/[0.04] px-2 py-0.5 rounded-full">
            {pg.type || "Unknown"}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span className="font-medium">User ID:</span>
          <span className="truncate max-w-[120px]">{pg.userid}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Context:</span>
          <span>{pg.from}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">IP:</span>
          <span className="font-mono text-indigo-400">{pg.ip || "Assigning..."}</span>
        </div>
        {pg.start && (
          <div className="flex items-center justify-between pt-2 border-t border-[var(--hairline)]">
            <span className="font-medium flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Uptime:
            </span>
            <span>{Math.floor((Date.now() - pg.start) / 60000)} mins</span>
          </div>
        )}
      </div>
    </div>
  );
}
