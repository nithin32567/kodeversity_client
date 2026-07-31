import React from "react";
import { Search, Layers, BookOpen, Calendar, Clock, Users } from "lucide-react";
import type { Batch } from "@/infrastructure/admin/managementService";
import { BatchStatusBadge } from "./BatchStatusBadge";

interface BatchListProps {
  filteredBatches: Batch[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectBatch: (batch: Batch) => void;
  onOpenCreateModal: () => void;
}

export function BatchList({
  filteredBatches,
  searchQuery,
  setSearchQuery,
  onSelectBatch,
  onOpenCreateModal,
}: BatchListProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--hairline)]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search batches by name, code, or course..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {filteredBatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
          <Layers className="h-12 w-12 text-muted-foreground/45 mb-3" />
          <h3 className="font-semibold text-lg text-foreground/80">No batches found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? "Try resetting your search filter."
              : "Create your first batch to start enrolling students."}
          </p>
          {!searchQuery && (
            <button
              onClick={onOpenCreateModal}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 text-sm transition cursor-pointer"
            >
              Create Batch Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBatches.map((batch) => (
            <div
              key={batch.id}
              className="flex flex-col p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/50 transition duration-300 group shadow-lg"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[17px] text-foreground truncate group-hover:text-blue-400 transition">
                    {batch.name}
                  </h3>
                  <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-mono bg-white/[0.04] text-muted-foreground rounded border border-[var(--hairline)]">
                    {batch.code}
                  </span>
                </div>
                <BatchStatusBadge status={batch.status} />
              </div>

              <div className="space-y-2.5 mt-5 flex-1 border-t border-b border-[var(--hairline)] py-4 my-4">
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <BookOpen className="h-4 w-4 text-blue-400/80 shrink-0" />
                  <span className="truncate text-foreground/90 font-medium">
                    {batch.course?.name || "General Study Batch"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4 text-purple-400/80 shrink-0" />
                  <span>
                    Starts:{" "}
                    {new Date(batch.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {batch.endDate && (
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Clock className="h-4 w-4 text-amber-400/80 shrink-0" />
                    <span>
                      Ends:{" "}
                      {new Date(batch.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelectBatch(batch)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-sm font-semibold text-blue-400 hover:text-blue-300 transition cursor-pointer"
              >
                <Users className="h-4 w-4" />
                Manage Cohort
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
