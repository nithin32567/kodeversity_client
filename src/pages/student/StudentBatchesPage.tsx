import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Layers,
  Calendar,
  Users,
  Megaphone,
  Clock,
  ChevronRight,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { studentService } from "@/infrastructure/student/studentService";
import {
  managementService,
  type Batch,
  type BatchStudent,
} from "@/infrastructure/admin/managementService";
import { MagicBentoCard } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";

export function StudentBatchesPage() {
  const glow = useAccentRgb();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [roster, setRoster] = useState<BatchStudent[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"schedule" | "announcements" | "classmates">(
    "schedule",
  );

  useEffect(() => {
    if (isAuthLoading || !user) return;

    const loadBatches = async () => {
      setLoading(true);
      try {
        const fetchedBatches = await studentService.getMyBatches(user.id);
        setBatches(fetchedBatches);
        if (fetchedBatches.length > 0) {
          setSelectedBatch(fetchedBatches[0]);
        }
      } catch (err) {
        console.error("Failed to load student batches:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadBatches();
  }, [isAuthLoading, user]);

  useEffect(() => {
    if (!selectedBatch) return;

    const loadRoster = async () => {
      setRosterLoading(true);
      try {
        const data = await managementService.getBatchRoster(selectedBatch.id);
        setRoster(data);
      } catch (err) {
        console.error("Failed to fetch batch roster:", err);
      } finally {
        setRosterLoading(false);
      }
    };

    void loadRoster();
  }, [selectedBatch]);

  if (isAuthLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-[var(--accent-cyan)] animate-spin" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Retrieving batch roster and cohorts...
          </p>
        </div>
      </div>
    );
  }

  const simulatedAnnouncements = [
    {
      id: "1",
      title: "Welcome to the Cohort Program! 🎉",
      content:
        "We are thrilled to start this learning journey with you. Check out the schedule tab to review upcoming lessons.",
      date: "2 days ago",
      author: "LMS Admin Team",
    },
    {
      id: "2",
      title: "Weekly Q&A Session Schedule",
      content:
        "Please note that the weekly live mentoring and doubt resolution will be scheduled every Friday evening. Attendance is highly recommended.",
      date: "5 days ago",
      author: "Lead Instructor",
    },
  ];

  return (
    <main className="relative flex-1 w-full overflow-hidden bg-background py-8 md:py-12">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 space-y-6 md:space-y-8">
        {batches.length === 0 ? (
          <article className="group relative flex flex-col rounded-2xl border border-dashed border-border bg-card/10 p-16 text-center transition-all hover:border-[var(--accent-cyan)]/50 hover:bg-[var(--accent-cyan)]/5 items-center justify-center">
            <Layers className="h-12 w-12 text-muted-foreground/45 mb-4 group-hover:text-[var(--accent-cyan)]/60 transition-colors" />
            <h3 className="font-bold text-base text-foreground/80 font-mono tracking-tight uppercase">
              No batches assigned
            </h3>
            <p className="text-[10px] font-mono tracking-widest text-muted-foreground mt-2 max-w-sm uppercase">
              You are not currently enrolled in any cohort batches. Contact support if this is an
              error.
            </p>
          </article>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Sidebar */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4">
                My Cohorts
              </h3>

              <div className="grid gap-3">
                {batches.map((batch) => {
                  const isSelected = selectedBatch?.id === batch.id;
                  return (
                    <div
                      key={batch.id}
                      onClick={() => setSelectedBatch(batch)}
                      className={`group relative flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[var(--accent-cyan)] bg-card shadow-[0_0_20px_-5px_var(--accent-cyan)]"
                          : "border-border bg-card hover:border-[var(--accent-cyan)]/50 hover:bg-card/80"
                      }`}
                    >
                      <div className="min-w-0">
                        <h4
                          className={`font-bold text-sm truncate uppercase tracking-wide font-mono ${
                            isSelected
                              ? "text-[var(--accent-cyan)]"
                              : "text-foreground group-hover:text-[var(--accent-cyan)]"
                          } transition-colors`}
                        >
                          {batch.name}
                        </h4>
                        <p className="text-[9px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">
                          Code: {batch.code} • Status: {batch.status}
                        </p>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-all ${
                          isSelected
                            ? "text-[var(--accent-cyan)] translate-x-1"
                            : "text-muted-foreground group-hover:text-[var(--accent-cyan)] group-hover:translate-x-1"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Content Pane */}
            <div className="lg:col-span-2 space-y-4">
              {selectedBatch && (
                <MagicBentoCard
                  className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 md:p-8 transition-all hover:border-[var(--accent-violet)] hover:shadow-[0_0_30px_-10px_var(--accent-violet)] overflow-hidden space-y-6"
                  glowColor={glow}
                  enableStars={false}
                >
                  {/* Decorative Pattern */}
                  <div
                    className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
                      backgroundSize: "12px 12px",
                    }}
                  />

                  <div className="relative z-10">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground font-mono uppercase">
                        {selectedBatch.name}
                      </h2>
                      <p className="text-[10px] font-mono tracking-widest text-muted-foreground mt-2 uppercase">
                        Course Topic: {selectedBatch.course?.name || "LMS Curriculum Block"}
                      </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border/60 pb-px gap-6 mt-6 overflow-x-auto [scrollbar-width:none]">
                      <button
                        onClick={() => setActiveTab("schedule")}
                        className={`pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === "schedule"
                            ? "border-[var(--accent-violet)] text-[var(--accent-violet)]"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Schedule
                      </button>
                      <button
                        onClick={() => setActiveTab("announcements")}
                        className={`pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === "announcements"
                            ? "border-[var(--accent-violet)] text-[var(--accent-violet)]"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Announcements
                      </button>
                      <button
                        onClick={() => setActiveTab("classmates")}
                        className={`pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === "classmates"
                            ? "border-[var(--accent-violet)] text-[var(--accent-violet)]"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Roster Classmates
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[220px] mt-6">
                      {activeTab === "schedule" && (
                        <div className="space-y-4">
                          <div className="p-5 rounded-2xl border border-border bg-foreground/[0.02] space-y-4">
                            <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-foreground font-mono">
                              <Calendar className="h-4 w-4 text-[var(--accent-violet)]" />
                              <span>Timeline Duration</span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                              <div>
                                Start Date:{" "}
                                <strong className="text-foreground block mt-1">
                                  {new Date(selectedBatch.startDate).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </strong>
                              </div>
                              {selectedBatch.endDate && (
                                <div>
                                  End Date:{" "}
                                  <strong className="text-foreground block mt-1">
                                    {new Date(selectedBatch.endDate).toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </strong>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-5 rounded-2xl border border-border bg-foreground/[0.02] space-y-3">
                            <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-foreground font-mono">
                              <Clock className="h-4 w-4 text-[var(--accent-cyan)]" />
                              <span>Weekly Commitment</span>
                            </div>
                            <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground leading-relaxed">
                              Scheduled live lectures will load directly under the{" "}
                              <strong className="text-foreground">Live Classes</strong> sidebar
                              item. Make sure you check this calendar daily.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === "announcements" && (
                        <div className="space-y-4">
                          {simulatedAnnouncements.map((ann) => (
                            <div
                              key={ann.id}
                              className="p-5 rounded-2xl border border-border bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors space-y-3"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <h4 className="font-bold text-sm text-foreground flex items-center gap-2 font-mono uppercase tracking-wide">
                                  <Megaphone className="h-4 w-4 text-[var(--accent-violet)] shrink-0" />
                                  {ann.title}
                                </h4>
                                <span className="text-[9px] font-mono tracking-widest uppercase text-[var(--accent-cyan)] shrink-0 bg-[var(--accent-cyan)]/10 px-2 py-1 rounded">
                                  {ann.date}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed ml-6">
                                {ann.content}
                              </p>
                              <div className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground/80 text-right">
                                By: <strong className="text-foreground">{ann.author}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === "classmates" && (
                        <div className="space-y-4">
                          {rosterLoading ? (
                            <div className="flex items-center justify-center py-10 gap-3 text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                              <RefreshCw className="h-4 w-4 animate-spin text-[var(--accent-violet)]" />
                              <span>Fetching cohort classmates...</span>
                            </div>
                          ) : roster.length === 0 ? (
                            <div className="text-center py-10 text-[10px] font-mono tracking-widest uppercase text-muted-foreground flex flex-col items-center justify-center gap-3">
                              <Users className="h-8 w-8 text-muted-foreground/30 mb-1" />
                              <span>Roster classmate listing is currently empty.</span>
                            </div>
                          ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                              {roster.map((r) => {
                                const isMe = r.studentId === user?.id;
                                const classMateInitials = (r.student.name || "Student")
                                  .split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .toUpperCase();

                                return (
                                  <div
                                    key={r.id}
                                    className={`p-4 rounded-xl border flex items-center gap-4 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors ${
                                      isMe ? "border-[var(--accent-cyan)]/30" : "border-border"
                                    }`}
                                  >
                                    <div
                                      className="h-10 w-10 shrink-0 rounded-full grid place-items-center text-background text-[11px] font-bold font-mono"
                                      style={{
                                        background: isMe
                                          ? "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))"
                                          : "var(--border)",
                                        color: isMe ? "var(--background)" : "var(--foreground)",
                                      }}
                                    >
                                      {classMateInitials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold text-foreground truncate flex items-center gap-2 font-mono uppercase tracking-wide">
                                        <span className="truncate">
                                          {r.student.name || "Enrolled Student"}
                                        </span>
                                        {isMe && (
                                          <span className="px-1.5 py-0.5 rounded text-[8px] tracking-widest bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20 shrink-0">
                                            YOU
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground truncate mt-1">
                                        {r.student.email}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </MagicBentoCard>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
