/**
 * UnlockRequests.tsx
 * Instructor / Admin Inbox — shows all pending module unlock requests.
 * Approve → violet, Reject → slate.
 * RTK Query auto-invalidates the pool on every action.
 */
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Inbox,
  AlertCircle,
  Clock,
  BookOpen,
  User,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetPendingUnlockRequestsQuery,
  useApproveUnlockRequestMutation,
  useRejectUnlockRequestMutation,
} from "@/features/curriculum/curriculumApi";
import type { UnlockRequest } from "@/features/curriculum/curriculumApi";

// ─── Sub-Components ───────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-[var(--hairline)] animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 w-full rounded-md bg-white/[0.06]" />
        </td>
      ))}
    </tr>
  );
}

function RequestRow({ request }: { request: UnlockRequest }) {
  const [approve, { isLoading: approving }] = useApproveUnlockRequestMutation();
  const [reject, { isLoading: rejecting }] = useRejectUnlockRequestMutation();
  const isBusy = approving || rejecting;

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
      toast.error(`❌ Request rejected for ${request.studentName || request.studentEmail}`);
    } catch {
      toast.error("Failed to reject request. Please try again.");
    }
  };

  const initials = (request.studentName || request.studentEmail || "ST").slice(0, 2).toUpperCase();
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
          <span className="line-clamp-1">{request.courseName}</span>
        </div>
      </td>

      {/* Target Module */}
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-300">
          {request.moduleName}
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {date}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600/50 bg-slate-700/60 px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-700 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {rejecting ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            Reject
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function UnlockRequests() {
  const { data: requests, isLoading, isError, refetch } = useGetPendingUnlockRequestsQuery();

  return (
    <main className="flex-1 overflow-y-auto px-4 pb-8 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--hairline)] pt-4 pb-5">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight md:text-3xl font-display">
            <Inbox className="h-7 w-7 text-violet-400" />
            Module Unlock Requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and action all pending student unlock requests for sequential modules.
          </p>
        </div>

        <button
          id="refresh-unlock-requests"
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending Requests"
          value={isLoading ? "—" : String(requests?.length ?? 0)}
          accent="violet"
          icon={<Clock className="h-4 w-4 text-violet-400" />}
        />
        <StatCard
          label="Students Waiting"
          value={isLoading ? "—" : String(new Set(requests?.map((r) => r.studentId)).size ?? 0)}
          accent="sky"
          icon={<User className="h-4 w-4 text-sky-400" />}
        />
        <StatCard
          label="Courses Affected"
          value={isLoading ? "—" : String(new Set(requests?.map((r) => r.courseId)).size ?? 0)}
          accent="indigo"
          icon={<BookOpen className="h-4 w-4 text-indigo-400" />}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-xl">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <AlertCircle className="h-12 w-12 text-rose-500 animate-pulse" />
            <p className="text-sm font-semibold">Failed to load pending requests</p>
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
                  {["Student", "Course", "Target Module", "Requested", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      <div className="flex items-center gap-1">
                        {h}
                        {h === "Requested" && <ChevronDown className="h-3 w-3" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : !requests || requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-violet-500/10">
                          <Inbox className="h-7 w-7 text-violet-400" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">All caught up!</p>
                        <p className="text-xs text-muted-foreground">
                          No pending unlock requests at the moment.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => <RequestRow key={req.id} request={req} />)
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: "violet" | "sky" | "indigo";
  icon: React.ReactNode;
}) {
  const border = {
    violet: "border-violet-500/20",
    sky: "border-sky-500/20",
    indigo: "border-indigo-500/20",
  }[accent];

  const bg = {
    violet: "bg-violet-500/8",
    sky: "bg-sky-500/8",
    indigo: "bg-indigo-500/8",
  }[accent];

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
