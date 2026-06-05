import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Layers,
  Search,
  Users,
  BookOpen,
  Calendar,
  Clock,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  UserMinus,
  Info,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import {
  instructorService,
  type InstructorBatch,
  type InstructorBatchStudent,
} from "@/infrastructure/instructor/instructorService";
import { managementService } from "@/infrastructure/admin/managementService";
import type { Course } from "@/domain/course";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/my-batches")({
  head: () => ({ meta: [{ title: "My Batches — Instructor Portal · Kodeversity" }] }),
  component: InstructorMyBatchesPage,
});

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    UPCOMING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    COMPLETED: "bg-white/5 text-muted-foreground border-white/10",
  };
  const dotMap: Record<string, string> = {
    ACTIVE: "bg-emerald-400 animate-pulse",
    UPCOMING: "bg-blue-400",
    COMPLETED: "bg-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] ?? "bg-white/5 text-muted-foreground border-white/10"}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotMap[status] ?? "bg-muted-foreground"}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────
function BatchCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)]/50 animate-pulse space-y-4">
      <div className="h-5 bg-white/[0.04] rounded w-2/3" />
      <div className="h-3 bg-white/[0.04] rounded w-1/3" />
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-white/[0.04] rounded" />
        <div className="h-3 bg-white/[0.04] rounded w-3/4" />
      </div>
      <div className="h-10 bg-white/[0.04] rounded-xl" />
    </div>
  );
}

function RosterRowSkeleton() {
  return (
    <div className="flex gap-4 items-center animate-pulse py-3 border-b border-[var(--hairline)]">
      <div className="h-9 w-9 rounded-full bg-white/[0.04]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/[0.04] rounded w-1/3" />
        <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
      </div>
      <div className="h-3 bg-white/[0.04] rounded w-20" />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function InstructorMyBatchesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  // Data states
  const [batches, setBatches] = useState<InstructorBatch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<InstructorBatch | null>(null);
  const [roster, setRoster] = useState<InstructorBatchStudent[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRosterLoading, setIsRosterLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [rosterSearch, setRosterSearch] = useState("");

  // Fetch batches + courses for instructor
  const fetchData = useCallback(async () => {
    if (isAuthLoading || !user) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const [fetchedBatches, fetchedCourses] = await Promise.all([
        instructorService.getMyBatches(),
        managementService.getCourses(),
      ]);

      // Client-side filter: only batches where this instructor owns the course
      let filteredBatches = fetchedBatches;
      if (user.role === "INSTRUCTOR" && user.id) {
        const instructorCourseIds = new Set(
          fetchedCourses
            .filter((c) => c.instructorId === user.id || c.instructor?.id === user.id)
            .map((c) => c.id),
        );
        // If we got specific instructor batches from the endpoint, keep them.
        // If we got all batches (fallback), filter client-side.
        if (instructorCourseIds.size > 0) {
          const clientFiltered = fetchedBatches.filter((b) => instructorCourseIds.has(b.courseId));
          // Use client-filtered only if the API returned all batches (no pre-filtering)
          if (clientFiltered.length < fetchedBatches.length) {
            filteredBatches = clientFiltered;
          }
        }
      }

      setBatches(filteredBatches);
      setCourses(fetchedCourses);
    } catch {
      setIsError(true);
      toast.error("Failed to load your batches.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthLoading, user]);

  // Fetch roster when a batch is selected
  const fetchRoster = useCallback(async (batchId: string) => {
    setIsRosterLoading(true);
    try {
      const data = await instructorService.getBatchRoster(batchId);
      setRoster(data);
    } catch {
      toast.error("Failed to load batch roster.");
    } finally {
      setIsRosterLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedBatch) {
      setRosterSearch("");
      fetchRoster(selectedBatch.id);
    }
  }, [selectedBatch, fetchRoster]);

  // Filtered batch list
  const filteredBatches = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return batches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        (b.course?.name ?? "").toLowerCase().includes(q),
    );
  }, [batches, searchQuery]);

  // Filtered roster
  const filteredRoster = useMemo(() => {
    const q = rosterSearch.toLowerCase();
    return roster.filter(
      (r) =>
        (r.student.name ?? "").toLowerCase().includes(q) ||
        r.student.email.toLowerCase().includes(q),
    );
  }, [roster, rosterSearch]);

  // Course name lookup
  const courseMap = useMemo(() => {
    const m = new Map<string, string>();
    courses.forEach((c) => m.set(c.id, c.title));
    return m;
  }, [courses]);

  if (isAuthLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-purple-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your batches...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-[var(--hairline)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Instructor portal</span>
            <span>&gt;</span>
            <span className="text-foreground font-medium">My Batches</span>
            {selectedBatch && (
              <>
                <span>&gt;</span>
                <span className="text-purple-400 font-semibold">{selectedBatch.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-display flex items-center gap-3">
            <Layers className="h-7 w-7 text-purple-400" />
            {selectedBatch ? selectedBatch.name : "My Batches"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedBatch
              ? `Viewing cohort roster and details for "${selectedBatch.name}".`
              : "Your assigned learning cohorts and student rosters."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedBatch ? (
            <button
              onClick={() => setSelectedBatch(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/80 text-sm text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Batches
            </button>
          ) : (
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-muted-foreground hover:text-foreground transition disabled:opacity-50 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* ── Error State ── */}
      {isError && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-3 animate-pulse" />
          <h3 className="font-semibold text-lg">Unable to load batches</h3>
          <button
            onClick={fetchData}
            className="mt-4 px-5 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-sm cursor-pointer hover:bg-[var(--surface)] transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── View 1: Batch Grid ── */}
      {!isError && !selectedBatch && (
        <div className="space-y-5">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--hairline)]">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batches by name, code, or course..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <BatchCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
              <Layers className="h-14 w-14 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-xl text-foreground/80">
                {searchQuery ? "No batches match your search" : "No batches assigned yet"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {searchQuery
                  ? "Try a different search term."
                  : "Ask your admin to assign batches to your courses. Your assigned cohorts will appear here."}
              </p>
              {!searchQuery && (
                <div className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)] text-xs text-muted-foreground">
                  <Info className="h-4 w-4 text-blue-400" />
                  Batches are created and assigned by admins.
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="group flex flex-col p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/50 hover:border-white/[0.1] transition-all duration-300 shadow-lg"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[17px] text-foreground truncate group-hover:text-purple-400 transition">
                        {batch.name}
                      </h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-mono bg-white/[0.04] text-muted-foreground rounded border border-[var(--hairline)]">
                        {batch.code}
                      </span>
                    </div>
                    <StatusBadge status={batch.status} />
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5 mt-5 flex-1 border-t border-b border-[var(--hairline)] py-4 my-4">
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <BookOpen className="h-4 w-4 text-blue-400/80 shrink-0" />
                      <span className="truncate text-foreground/90 font-medium">
                        {batch.course?.name ?? courseMap.get(batch.courseId) ?? "Course"}
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

                  {/* Action */}
                  <button
                    onClick={() => setSelectedBatch(batch)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-sm font-semibold text-purple-400 hover:text-purple-300 transition cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    View Roster
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── View 2: Batch Detail + Roster ── */}
      {!isError && selectedBatch && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Batch Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] space-y-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-full blur-2xl" />
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground font-display">
                    {selectedBatch.name}
                  </h3>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-mono bg-white/[0.04] text-muted-foreground rounded-lg border border-[var(--hairline)]">
                    Code: {selectedBatch.code}
                  </span>
                </div>
                <StatusBadge status={selectedBatch.status} />
              </div>

              <div className="space-y-3.5 pt-4 border-t border-[var(--hairline)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-400 shrink-0" />
                    Course
                  </span>
                  <span className="font-semibold text-foreground max-w-[180px] truncate text-right">
                    {selectedBatch.course?.name ??
                      courseMap.get(selectedBatch.courseId) ??
                      "Course"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400 shrink-0" />
                    Start Date
                  </span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedBatch.startDate).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>
                {selectedBatch.endDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                      End Date
                    </span>
                    <span className="font-medium text-foreground">
                      {new Date(selectedBatch.endDate).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-400 shrink-0" />
                    Roster Size
                  </span>
                  <span className="font-bold text-foreground font-mono bg-white/[0.04] px-2 py-0.5 rounded border border-[var(--hairline)]">
                    {roster.length} student{roster.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Read-only note */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-300/80 leading-relaxed">
                As an instructor you can view your cohort roster. Student enrollment is managed by
                the platform admin.
              </p>
            </div>
          </div>

          {/* Right Column: Roster Table */}
          <div className="lg:col-span-8 p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--hairline)]">
              <div>
                <h3 className="font-semibold text-lg text-foreground font-display flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" />
                  Cohort Roster
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All students enrolled in this cohort.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-mono bg-white/[0.04] text-muted-foreground rounded-lg border border-[var(--hairline)]">
                  Total: {roster.length}
                </span>
                <button
                  onClick={() => fetchRoster(selectedBatch.id)}
                  disabled={isRosterLoading}
                  className="p-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-muted-foreground hover:text-foreground transition cursor-pointer disabled:opacity-50"
                  title="Refresh roster"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRosterLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Roster search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Filter students by name or email..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {isRosterLoading ? (
              <div className="py-4 space-y-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <RosterRowSkeleton key={i} />
                ))}
              </div>
            ) : filteredRoster.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-14 text-center">
                <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <h4 className="font-semibold text-foreground/80">
                  {rosterSearch ? "No matching students" : "Roster is empty"}
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  {rosterSearch
                    ? "Try a different search term."
                    : "No students have been enrolled in this batch yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-[var(--hairline)]">
                      <th className="py-3 font-semibold">#</th>
                      <th className="py-3 font-semibold">Student</th>
                      <th className="py-3 px-4 font-semibold">Email</th>
                      <th className="py-3 font-semibold text-right">Enrolled On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--hairline)]">
                    {filteredRoster.map((r, idx) => (
                      <tr key={r.id} className="group hover:bg-[var(--surface-2)]/30 transition">
                        <td className="py-3.5 pr-2 text-xs text-muted-foreground font-mono">
                          {String(idx + 1).padStart(2, "0")}
                        </td>
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-3">
                            {r.student.avatarUrl ? (
                              <img
                                src={r.student.avatarUrl}
                                alt={r.student.name ?? ""}
                                className="h-9 w-9 rounded-full object-cover border border-[var(--hairline)]"
                              />
                            ) : (
                              <div
                                className="h-9 w-9 rounded-full grid place-items-center text-white text-[11px] font-semibold border border-[var(--hairline)]"
                                style={{ background: "var(--grad-purple)" }}
                              >
                                {(r.student.name ?? "ST").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="font-medium text-foreground truncate max-w-[160px]">
                              {r.student.name ?? "Unnamed Student"}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground truncate max-w-[200px]">
                          {r.student.email}
                        </td>
                        <td className="py-3.5 text-xs text-muted-foreground text-right">
                          {new Date(r.joinedAt).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
