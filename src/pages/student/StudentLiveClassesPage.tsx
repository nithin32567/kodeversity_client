import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Video,
  Calendar,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { studentService } from "@/infrastructure/student/studentService";
import type { LiveSession } from "@/infrastructure/admin/liveClassesService";
import { toast } from "sonner";
import { MagicBentoCard } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";

export function StudentLiveClassesPage() {
  const glow = useAccentRgb();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiveClasses = useCallback(
    async (showPulse = false) => {
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
    },
    [user],
  );

  useEffect(() => {
    if (isAuthLoading || !user) return;
    void fetchLiveClasses();

    const interval = setInterval(() => {
      void fetchLiveClasses(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthLoading, user, fetchLiveClasses]);

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
          <RefreshCw className="h-8 w-8 text-[var(--accent-cyan)] animate-spin" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Syncing your active classes schedule...</p>
        </div>
      </div>
    );
  }

  const handleJoinClass = (meetingId: string) => {
    toast.success("Connecting to classroom session...");
    navigate(`/meetings/${meetingId}`);
  };

  return (
    <main className="relative flex-1 w-full overflow-hidden bg-background py-8 md:py-12">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 space-y-6 md:space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-mono uppercase flex items-center gap-3">
              <Video className="h-6 w-6 text-[var(--accent-cyan)]" />
              Live Classes
            </h2>
            <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-2">
              Attend live interactive lectures, Q&A sessions, and cohort reviews.
            </p>
          </div>
          <button
            onClick={() => void fetchLiveClasses(true)}
            disabled={refreshing}
            className="group/btn inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.02] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/90 transition-colors hover:border-[var(--accent-cyan)]/40 hover:text-[var(--accent-cyan)] disabled:opacity-50"
            title="Refresh Schedule"
          >
            <span>Refresh</span>
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {meetings.length === 0 ? (
          <article className="group relative flex flex-col rounded-2xl border border-dashed border-border bg-card/10 p-16 text-center transition-all hover:border-[var(--accent-cyan)]/50 hover:bg-[var(--accent-cyan)]/5 items-center justify-center">
            <Video className="h-12 w-12 text-muted-foreground/45 mb-4 group-hover:text-[var(--accent-cyan)]/60 transition-colors" />
            <h3 className="font-bold text-base text-foreground/80 font-mono tracking-tight uppercase">No sessions assigned</h3>
            <p className="text-[10px] font-mono tracking-widest text-muted-foreground mt-2 max-w-sm uppercase">
              There are no live classes scheduled for your batches at the moment.
            </p>
          </article>
        ) : (
          <div className="space-y-10">
            {/* Live Now Section */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-red-500 uppercase flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Live Now
              </h3>

              {liveSessions.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-border bg-foreground/[0.01] text-center text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                  No session is actively live right now.
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {liveSessions.map((meeting) => (
                    <MagicBentoCard
                      key={meeting.id}
                      className="group relative flex flex-col rounded-2xl border border-red-500/30 bg-card p-6 transition-all hover:border-red-500 hover:shadow-[0_0_30px_-10px_rgba(239,68,68,0.5)] overflow-hidden"
                      glowColor={glow}
                      enableTilt
                    >
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500 animate-pulse" />
                      <div
                        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
                        style={{
                          backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
                          backgroundSize: "12px 12px",
                        }}
                      />

                      <div className="space-y-4 relative z-10 flex flex-col flex-1">
                        <div>
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-widest">
                            Active Class
                          </span>
                          <h4 className="font-bold text-lg text-foreground font-mono uppercase tracking-wide line-clamp-1 mt-4 group-hover:text-red-400 transition-colors">
                            {meeting.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">
                            Cohort: {meeting.batchName || "N/A"}
                          </p>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
                          {meeting.description || "No session description provided."}
                        </p>

                        <div className="pt-4 border-t border-border/60 flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-auto">
                          <Clock className="h-3.5 w-3.5 text-red-400" />
                          <span>
                            Duration: <strong className="text-foreground">{meeting.duration} mins</strong>
                          </span>
                        </div>

                        <button
                          onClick={() => handleJoinClass(meeting.id)}
                          className="group/btn mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-500 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(239,68,68,0.5)] animate-pulse hover:animate-none"
                        >
                          <span>Join Class Now</span>
                          <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                        </button>
                      </div>
                    </MagicBentoCard>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Sessions Section */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[var(--accent-violet)]" />
                Upcoming Sessions
              </h3>

              {upcomingSessions.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-border bg-foreground/[0.01] text-center text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                  No future sessions scheduled. Check back later!
                </div>
              ) : (
                <MagicBentoCard
                  className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 relative before:absolute before:left-9 md:before:left-[2.1rem] before:top-8 before:bottom-8 before:w-[2px] before:bg-border transition-all hover:border-[var(--accent-violet)] hover:shadow-[0_0_30px_-10px_var(--accent-violet)]"
                  glowColor={glow}
                  enableStars={false}
                >
                  {upcomingSessions.map((meeting) => (
                    <div key={meeting.id} className="relative pl-12 space-y-3 group/item">
                      {/* Timeline dot */}
                      <div className="absolute left-[5px] md:left-[1px] top-1.5 h-3.5 w-3.5 rounded-full bg-card border-2 border-border group-hover/item:border-[var(--accent-violet)] group-hover/item:bg-[var(--accent-violet)] group-hover/item:shadow-[0_0_12px_var(--accent-violet)] transition-all ring-4 ring-card" />

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--accent-violet)] uppercase">
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
                          <h4 className="font-bold text-base text-foreground font-mono uppercase tracking-wide group-hover/item:text-[var(--accent-violet)] transition-colors">
                            {meeting.title}
                          </h4>
                          <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                            Cohort: {meeting.batchName || "N/A"}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase text-muted-foreground shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
                            <span>{meeting.duration} mins</span>
                          </div>
                          <button
                            disabled
                            className="px-4 py-2 rounded-full border border-foreground/15 bg-foreground/[0.02] text-muted-foreground font-semibold cursor-not-allowed opacity-50"
                          >
                            Waiting for Host...
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground max-w-3xl leading-relaxed">
                        {meeting.description || "No session description provided."}
                      </p>
                    </div>
                  ))}
                </MagicBentoCard>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
