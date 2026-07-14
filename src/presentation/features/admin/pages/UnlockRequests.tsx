/**
 * UnlockRequests.tsx
 * Unified Module Unlock Request management page for Admin and Instructor portals.
 *
 * ADMIN view    → all requests platform-wide, all statuses, includes "Assigned Instructor" column.
 * INSTRUCTOR view → only requests whose assignedInstructorId === current user's id.
 *
 * Status badges: Yellow (PENDING), Green (APPROVED), Red (REJECTED).
 * Actions: Approve / Reject buttons, inline-loading spinners.
 */
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Inbox,
  AlertCircle,
  Clock,
  BookOpen,
  User,
  GraduationCap,
  Filter,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllUnlockRequestsQuery,
  useGetInstructorUnlockRequestsQuery,
  useApproveUnlockRequestMutation,
  useRejectUnlockRequestMutation,
} from "@/features/curriculum/curriculumApi";
import type { UnlockRequest, UnlockRequestStatus } from "@/features/curriculum/curriculumApi";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";

// ─── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = "ALL" | UnlockRequestStatus;

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: UnlockRequestStatus }) {
  const config = {
    PENDING: {
      label: "Pending",
      cls: "bg-amber-500/15 text-amber-300 border-amber-500/25",
      icon: <Clock className="h-3 w-3 animate-pulse" />,
    },
    APPROVED: {
      label: "Approved",
      cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    REJECTED: {
      label: "Rejected",
      cls: "bg-rose-500/15 text-rose-300 border-rose-500/25",
      icon: <XCircle className="h-3 w-3" />,
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${config.cls}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

// ─── Skeleton Row ──────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-[var(--hairline)] animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 w-full rounded-md bg-white/[0.06]" />
        </td>
      ))}
    </tr>
  );
}

// ─── Request Row ───────────────────────────────────────────────────────────────

function RequestRow({
  request,
  showInstructor,
}: {
  request: UnlockRequest;
  showInstructor: boolean;
}) {
  const [approve, { isLoading: approving }] = useApproveUnlockRequestMutation();
  const [reject, { isLoading: rejecting }] = useRejectUnlockRequestMutation();
  const isBusy = approving || rejecting;
  const isPending = request.status === "PENDING";

  const handleApprove = async () => {
    try {
      await approve(request.id).unwrap();
      toast.success(
        `✅ Unlocked "${request.moduleName}" for ${request.studentName || request.studentEmail}`,
      );
    } catch {
      toast.error("Failed to approve request. Please try again.");
    }
  };

  const handleReject = async () => {
    try {
      await reject(request.id).unwrap();
      toast.warning(`❌ Request rejected for ${request.studentName || request.studentEmail}`);
    } catch {
      toast.error("Failed to reject request. Please try again.");
    }
  };

  const initials = (request.studentName || request.studentEmail || "ST").slice(0, 2).toUpperCase();
  const instructorInitials = (request.assignedInstructorName || "IN").slice(0, 2).toUpperCase();

  const date = new Date(request.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <tr className="group border-b border-[var(--hairline)] transition hover:bg-white/[0.02]">
      {/* Student */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#6366f1)" }}
          >
            {initials}
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground leading-none">
              {request.studentName || "Unknown"}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{request.studentEmail}</p>
          </div>
        </div>
      </td>

      {/* Course */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-xs text-foreground/80">
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-sky-400" />
          <span className="line-clamp-1">{request.courseName || request.courseId}</span>
        </div>
      </td>

      {/* Target Module */}
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-300">
          <Unlock className="h-3 w-3" />
          {request.moduleName || request.moduleId}
        </span>
      </td>

      {/* Assigned Instructor — only shown on Admin view */}
      {showInstructor && (
        <td className="px-4 py-3.5">
          {request.assignedInstructorName ? (
            <div className="flex items-center gap-2">
              <div
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white"
                style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}
              >
                {instructorInitials}
              </div>
              <span className="text-xs text-foreground/80">{request.assignedInstructorName}</span>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground/50 italic">Unassigned</span>
          )}
        </td>
      )}

      {/* Status */}
      <td className="px-4 py-3.5">
        <StatusBadge status={request.status} />
      </td>

      {/* Requested date */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          {date}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        {isPending ? (
          <div className="flex items-center gap-2">
            <button
              id={`approve-request-${request.id}`}
              onClick={handleApprove}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-500 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {approving ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              Approve
            </button>

            <button
              id={`reject-request-${request.id}`}
              onClick={handleReject}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600/50 bg-slate-700/60 px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-300 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {rejecting ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              Reject
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground italic">
            {request.status === "APPROVED" ? "Approved ✓" : "Rejected ✗"}
          </span>
        )}
      </td>
    </tr>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: "violet" | "amber" | "emerald" | "rose" | "sky" | "indigo";
  icon: React.ReactNode;
}) {
  const styles: Record<string, { border: string; bg: string }> = {
    violet: { border: "border-violet-500/20", bg: "bg-violet-500/[0.08]" },
    amber: { border: "border-amber-500/20", bg: "bg-amber-500/[0.08]" },
    emerald: { border: "border-emerald-500/20", bg: "bg-emerald-500/[0.08]" },
    rose: { border: "border-rose-500/20", bg: "bg-rose-500/[0.08]" },
    sky: { border: "border-sky-500/20", bg: "bg-sky-500/[0.08]" },
    indigo: { border: "border-indigo-500/20", bg: "bg-indigo-500/[0.08]" },
  };
  const { border, bg } = styles[accent];

  return (
    <div className={`flex items-center gap-3 rounded-xl border ${border} ${bg} p-4`}>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.04]">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-foreground leading-none">{value}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ─── Filter Tab ────────────────────────────────────────────────────────────────

function FilterTab({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
        active
          ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent"
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`inline-flex items-center justify-center h-4.5 min-w-[1.125rem] rounded-full px-1.5 text-[9px] font-bold ${
            active ? "bg-violet-500/30 text-violet-200" : "bg-white/[0.08] text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function UnlockRequests() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  // Admin fetches all requests; Instructor fetches only their own
  const adminQuery = useGetAllUnlockRequestsQuery(undefined, { skip: !isAdmin });
  const instructorQuery = useGetInstructorUnlockRequestsQuery(undefined, { skip: isAdmin });

  const { data: allRequests, isLoading, isError, refetch } = isAdmin ? adminQuery : instructorQuery;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Derived counts ───────────────────────────────────────────────────────────
  const pendingCount = allRequests?.filter((r) => r.status === "PENDING").length ?? 0;
  const approvedCount = allRequests?.filter((r) => r.status === "APPROVED").length ?? 0;
  const rejectedCount = allRequests?.filter((r) => r.status === "REJECTED").length ?? 0;
  const totalCount = allRequests?.length ?? 0;

  // ── Filter logic ─────────────────────────────────────────────────────────────
  const filteredRequests = (allRequests ?? []).filter((r) => {
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.studentName?.toLowerCase().includes(q) ||
      r.studentEmail?.toLowerCase().includes(q) ||
      r.courseName?.toLowerCase().includes(q) ||
      r.moduleName?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const colCount = isAdmin ? 7 : 6; // admin has "Assigned Instructor" column

  return (
    <main className="flex-1 overflow-y-auto px-4 pb-8 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--hairline)] pt-4 pb-5">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight md:text-3xl font-display">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/15 border border-violet-500/25">
              <Inbox className="h-5 w-5 text-violet-400" />
            </div>
            Module Unlock Requests
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isAdmin
              ? "Platform-wide view of all student module unlock requests. Approve or reject to control progression."
              : "Unlock requests from your assigned students. Approve to let them progress to the next module."}
          </p>
        </div>

        <button
          id="refresh-unlock-requests"
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={isLoading ? "—" : String(totalCount)}
          accent="violet"
          icon={<Inbox className="h-4 w-4 text-violet-400" />}
        />
        <StatCard
          label="Pending Review"
          value={isLoading ? "—" : String(pendingCount)}
          accent="amber"
          icon={<Clock className="h-4 w-4 text-amber-400" />}
        />
        <StatCard
          label="Approved"
          value={isLoading ? "—" : String(approvedCount)}
          accent="emerald"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        />
        <StatCard
          label="Rejected"
          value={isLoading ? "—" : String(rejectedCount)}
          accent="rose"
          icon={<XCircle className="h-4 w-4 text-rose-400" />}
        />
      </div>

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 p-1">
          <FilterTab
            label="All"
            active={statusFilter === "ALL"}
            count={totalCount}
            onClick={() => setStatusFilter("ALL")}
          />
          <FilterTab
            label="Pending"
            active={statusFilter === "PENDING"}
            count={pendingCount}
            onClick={() => setStatusFilter("PENDING")}
          />
          <FilterTab
            label="Approved"
            active={statusFilter === "APPROVED"}
            count={approvedCount}
            onClick={() => setStatusFilter("APPROVED")}
          />
          <FilterTab
            label="Rejected"
            active={statusFilter === "REJECTED"}
            count={rejectedCount}
            onClick={() => setStatusFilter("REJECTED")}
          />
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm ml-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            id="unlock-requests-search"
            type="text"
            placeholder="Search student, course, module…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/40 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition"
          />
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-xl">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <AlertCircle className="h-12 w-12 text-rose-500 animate-pulse" />
            <p className="text-sm font-semibold">Failed to load unlock requests</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Could not reach the course service. Check your network and try again.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 rounded-lg border border-[var(--hairline)] px-4 py-2 text-xs text-foreground transition hover:bg-[var(--surface-2)]"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--hairline)] bg-white/[0.02]">
                  {[
                    "Student",
                    "Course",
                    "Target Module",
                    ...(isAdmin ? ["Assigned Instructor"] : []),
                    "Status",
                    "Requested",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} cols={colCount} />
                  ))
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={colCount} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-violet-500/10">
                          <Inbox className="h-7 w-7 text-violet-400" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {searchQuery || statusFilter !== "ALL"
                            ? "No requests match your filter"
                            : "All caught up!"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {searchQuery || statusFilter !== "ALL"
                            ? "Try adjusting your search or filter criteria."
                            : "No module unlock requests at the moment."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <RequestRow key={req.id} request={req} showInstructor={isAdmin} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Footer count ──────────────────────────────────────────────────── */}
      {!isLoading && !isError && filteredRequests.length > 0 && (
        <p className="text-center text-[11px] text-muted-foreground">
          Showing{" "}
          <span className="text-foreground font-semibold">{filteredRequests.length}</span> of{" "}
          <span className="text-foreground font-semibold">{totalCount}</span> requests
        </p>
      )}
    </main>
  );
}
