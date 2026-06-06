import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/_auth/student/batches")({
  head: () => ({ meta: [{ title: "My Batches — Kodeversity" }] }),
  component: MyBatchesPage,
});

export function MyBatchesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail selection
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

  // Load roster details when selectedBatch changes
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
          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Retrieving batch roster and cohorts...</p>
        </div>
      </div>
    );
  }

  // Predefined simulated announcements for cohorts
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
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
      {batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-border bg-card/10 text-center">
          <Layers className="h-12 w-12 text-muted-foreground/45 mb-3" />
          <h3 className="font-semibold text-lg text-foreground/80">No batches assigned</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            You are not currently enrolled in any cohort batches. Contact support if this is an
            error.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          {/* ── LEFT COLUMN: BATCH CARDS ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              My Cohorts
            </h3>

            <div className="grid gap-3">
              {batches.map((batch) => {
                const isSelected = selectedBatch?.id === batch.id;
                return (
                  <div
                    key={batch.id}
                    onClick={() => setSelectedBatch(batch)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-center bg-card hover:bg-card/80 ${
                      isSelected
                        ? "border-primary shadow-md shadow-primary/5 bg-card/60"
                        : "border-border"
                    }`}
                  >
                    <div className="min-w-0">
                      <h4
                        className={`font-semibold text-sm truncate ${isSelected ? "text-indigo-400" : "text-foreground"}`}
                      >
                        {batch.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        Code: {batch.code} • Status: {batch.status}
                      </p>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isSelected ? "translate-x-1" : ""}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT COLUMN: COHORT DETAILS ── */}
          <div className="lg:col-span-2 space-y-4">
            {selectedBatch && (
              <div className="p-6 rounded-2xl border border-border bg-card shadow-lg space-y-5">
                {/* Header */}
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-display">
                    {selectedBatch.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Course Topic: {selectedBatch.course?.name || "LMS Curriculum Block"}
                  </p>
                </div>

                {/* Tabs Menu */}
                <div className="flex border-b border-border pb-0.5 gap-4">
                  <button
                    onClick={() => setActiveTab("schedule")}
                    className={`pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
                      activeTab === "schedule"
                        ? "border-indigo-500 text-indigo-400 font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Schedule
                  </button>
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className={`pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
                      activeTab === "announcements"
                        ? "border-indigo-500 text-indigo-400 font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Announcements
                  </button>
                  <button
                    onClick={() => setActiveTab("classmates")}
                    className={`pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
                      activeTab === "classmates"
                        ? "border-indigo-500 text-indigo-400 font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Roster Classmates
                  </button>
                </div>

                {/* Tab Content Panels */}
                <div className="min-h-[220px]">
                  {activeTab === "schedule" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-border bg-card/35 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-white">
                          <Calendar className="h-4 w-4 text-indigo-400" />
                          <span>Timeline Duration</span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
                          <div>
                            Start Date:{" "}
                            <strong className="text-foreground">
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
                              <strong className="text-foreground">
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

                      <div className="p-4 rounded-xl border border-border bg-card/35 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-white">
                          <Clock className="h-4 w-4 text-purple-400" />
                          <span>Weekly Commitment</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Scheduled live lectures will load directly under the{" "}
                          <strong>Live Classes</strong> sidebar item. Make sure you check this
                          calendar daily.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "announcements" && (
                    <div className="space-y-4">
                      {simulatedAnnouncements.map((ann) => (
                        <div
                          key={ann.id}
                          className="p-4 rounded-xl border border-border bg-card/20 hover:bg-card/40 transition space-y-2"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                              <Megaphone className="h-3.5 w-3.5 text-indigo-400" />
                              {ann.title}
                            </h4>
                            <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                              {ann.date}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {ann.content}
                          </p>
                          <div className="text-[10px] text-muted-foreground/80 text-right">
                            By: <strong>{ann.author}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "classmates" && (
                    <div className="space-y-3">
                      {rosterLoading ? (
                        <div className="flex items-center justify-center py-8 gap-2 text-xs text-muted-foreground">
                          <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                          <span>Fetching cohort classmates...</span>
                        </div>
                      ) : roster.length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground flex flex-col items-center justify-center gap-1">
                          <Users className="h-7 w-7 text-muted-foreground/40 mb-1" />
                          <span>Roster classmate listing is currently empty.</span>
                        </div>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
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
                                className={`p-3 rounded-lg border flex items-center gap-3 bg-card/10 hover:bg-card/30 transition ${
                                  isMe ? "border-primary/20" : "border-border"
                                }`}
                              >
                                <div
                                  className="h-8 w-8 rounded-full grid place-items-center text-white text-[11px] font-bold"
                                  style={{
                                    background: isMe ? "var(--gradient-primary)" : "var(--gradient-primary-soft)",
                                  }}
                                >
                                  {classMateInitials}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                    <span className="truncate">
                                      {r.student.name || "Enrolled Student"}
                                    </span>
                                    {isMe && (
                                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-bold shrink-0">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground truncate">
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
            )}
          </div>
        </div>
      )}
    </main>
  );
}
