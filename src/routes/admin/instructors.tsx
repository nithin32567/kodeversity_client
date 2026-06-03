import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, GraduationCap, AlertCircle, Briefcase, FileText } from "lucide-react";
import { managementService } from "@/infrastructure/admin/managementService";
import type { Instructor } from "@/domain/course";

export const Route = createFileRoute("/admin/instructors")({
  head: () => ({ meta: [{ title: "Instructor Management — Kodeversity" }] }),
  component: AdminInstructorsPage,
});

export function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInstructors = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    managementService
      .getInstructors()
      .then((instructorList) => {
        setInstructors(instructorList);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load instructors:", err);
        setIsError(true);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const filteredInstructors = useMemo(() => {
    return instructors.filter((ins) => {
      return (
        (ins.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (ins.designation?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      );
    });
  }, [instructors, searchQuery]);

  return (
    <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-display">
            Instructor Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all registered instructors.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--hairline)]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or designation..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 animate-pulse"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 rounded-full bg-white/[0.04]" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-white/[0.04] rounded w-3/4" />
                  <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                </div>
              </div>
              <div className="h-16 bg-white/[0.04] rounded w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-3 animate-pulse" />
          <h3 className="font-semibold text-lg">Unable to load instructors</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            There was an error connecting to the authentication service.
          </p>
          <button
            onClick={fetchInstructors}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-sm text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredInstructors.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="font-semibold text-lg text-foreground/80">
            No instructors match your query
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Try resetting your search term.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInstructors.map((instructor) => (
            <div
              key={instructor.id}
              className="flex flex-col p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition h-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {instructor.avatarUrl ? (
                    <img
                      src={instructor.avatarUrl}
                      alt={instructor.name}
                      className="h-14 w-14 rounded-full object-cover border border-[var(--hairline)]"
                    />
                  ) : (
                    <div
                      className="h-14 w-14 rounded-full grid place-items-center text-white text-base font-semibold border border-[var(--hairline)]"
                      style={{ background: "var(--grad-cta)" }}
                    >
                      {(instructor.name || "UN").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-[var(--surface)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold truncate text-foreground">
                    {instructor.name}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                    <Briefcase className="h-3 w-3" />
                    <span className="truncate">{instructor.designation}</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-[var(--hairline)]">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {instructor.bio || "No biography provided."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
