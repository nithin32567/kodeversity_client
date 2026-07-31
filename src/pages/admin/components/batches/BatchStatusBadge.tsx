import React from "react";

interface BatchStatusBadgeProps {
  status: string;
}

export function BatchStatusBadge({ status }: BatchStatusBadgeProps) {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
      );
    case "UPCOMING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          Upcoming
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-muted-foreground border border-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
          Completed
        </span>
      );
    case "SUSPENDED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          Suspended
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-muted-foreground border border-white/10">
          {status}
        </span>
      );
  }
}
