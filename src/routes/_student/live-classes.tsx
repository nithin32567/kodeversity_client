import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Video,
  Calendar,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { studentService } from "@/infrastructure/student/studentService";
import type { LiveSession } from "@/infrastructure/admin/liveClassesService";
import { toast } from "sonner";

export const Route = createFileRoute("/_student/live-classes")({
  head: () => ({ meta: [{ title: "Live Classes — Kodeversity" }] }),
  component: StudentLiveClassesPage,
});

export function StudentLiveClassesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiveClasses = async (showPulse = false) => {
    if (!user) return;
    if (showPulse) setRefreshing(true);
    try {
      const data = await studentService.getMyLiveClasses(user.id);
      setMeetings(data);
    } catch (err) {
      console.error("Failed to load live sessions:", err);
      toast.error("Failed to fetch live classes schedule.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !user) return;
    void fetchLiveClasses();
  }, [isAuthLoading, user]);

  // Split sessions into Live and Upcoming
  const liveSessions = useMemo(() => {
    return meetings.filter((m) => m.status === "LIVE");
  }, [meetings]);

  const upcomingSessions = useMemo(() => {
    return meetings.filter((m) => m.status === "UPCOMING");
  }, [meetings]);

  if (isAuthLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Syncing your active classes schedule...</p>
        </div>
      </div>
    );
  }

  const handleJoinClass = (sessionId: string) => {
    toast.success("Connecting to classroom session...");
    void navigate({ to: "/meetings/$sessionId", params: { sessionId } });
  };

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display flex items-center gap-2">
            <Video className="h-6 w-6 text-indigo-400" />
            Live Classes
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Attend live interactive lectures, Q&A sessions, and cohort reviews.
          </p>
        </div>
        <button
          onClick={() => void fetchLiveClasses(true)}
          disabled={refreshing}
          className="p-2 rounded-lg border border-border bg-card/45 hover:bg-card text-muted-foreground hover:text-foreground transition disabled:opacity-50"
          title="Refresh Schedule"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-border bg-card/10 text-center">
          <Video className="h-12 w-12 text-muted-foreground/45 mb-3" />
          <h3 className="font-semibold text-lg text-foreground/80">No sessions assigned</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            There are no live classes scheduled for your batches at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── SECTION 1: LIVE NOW ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-red-400 uppercase flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Live Now
            </h3>

            {liveSessions.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-border bg-white/[0.01] text-center text-xs text-muted-foreground">
                No session is actively live right now.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {liveSessions.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-5 rounded-2xl border border-red-500/30 bg-card hover:bg-card/85 transition duration-300 relative overflow-hidden shadow-lg shadow-red-950/10"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500 animate-pulse" />

                    <div className="space-y-3">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                          Active Class
                        </span>
                        <h4 className="font-bold text-[15px] text-white line-clamp-1 mt-2">
                          {meeting.title}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          Cohort: {meeting.batchName || "N/A"}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                        {meeting.description || "No session description provided."}
                      </p>

                      <div className="pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-red-400/80" />
                        <span>
                          Duration: <strong>{meeting.duration} mins</strong>
                        </span>
                      </div>

                      <button
                        onClick={() => handleJoinClass(meeting.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/20 active:scale-[0.98] transition cursor-pointer"
                      >
                        <span>Join Class</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SECTION 2: UPCOMING SESSIONS ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Upcoming Sessions
            </h3>

            {upcomingSessions.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-border bg-white/[0.01] text-center text-xs text-muted-foreground">
                No future sessions scheduled. Check back later!
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-border bg-card shadow-lg space-y-6 relative before:absolute before:left-8 before:top-6 before:bottom-6 before:w-[1px] before:bg-border">
                {upcomingSessions.map((meeting) => (
                  <div key={meeting.id} className="relative pl-10 space-y-2 group">
                    {/* Circle dot */}
                    <div className="absolute left-[26px] top-1.5 h-3.5 w-3.5 rounded-full bg-card/60 border border-border group-hover:border-indigo-400 transition ring-4 ring-card" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-indigo-400 uppercase">
                          {new Date(meeting.startTime).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(meeting.startTime).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition">
                          {meeting.title}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono">
                          Cohort: {meeting.batchName || "N/A"}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground sm:text-right shrink-0">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
                          <span>{meeting.duration} mins</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                      {meeting.description || "No session description provided."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
