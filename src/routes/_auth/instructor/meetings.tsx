import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Video,
  Plus,
  Search,
  Users,
  BookOpen,
  Calendar,
  Clock,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronDown,
  User,
  Play,
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import {
  managementService,
  type Batch,
  type BatchStudent,
} from "@/infrastructure/admin/managementService";
import { instructorService } from "@/infrastructure/instructor/instructorService";
import type { Course } from "@/domain/course";
import {
  liveClassesService,
  type LiveSession,
  type MeetingStatus,
  type MeetingType,
} from "@/infrastructure/admin/liveClassesService";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/instructor/meetings")({
  head: () => ({ meta: [{ title: "Live Classes Management — Kodeversity" }] }),
  component: LiveClassesPage,
});

export function LiveClassesPage() {
  const { isLoading: isAuthLoading, isAuthenticated, user } = useAuth();

  // Role detection
  const userRole = user?.role || "INSTRUCTOR"; // fallback safety
  const isAdmin = userRole === "ADMIN";

  // Data states
  const [batches, setBatches] = useState<Batch[]>([]);
  const [meetings, setMeetings] = useState<LiveSession[]>([]);
  const [roster, setRoster] = useState<BatchStudent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isMeetingsLoading, setIsMeetingsLoading] = useState(false);
  const [isRosterLoading, setIsRosterLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab State: "upcoming" | "live" | "completed"
  const [activeTab, setActiveTab] = useState<"upcoming" | "live" | "completed">("upcoming");

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Creation Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formDuration, setFormDuration] = useState(60);
  const [formBatchId, setFormBatchId] = useState("");
  const [formAudience, setFormAudience] = useState<"ALL_BATCH" | "CUSTOM_STUDENTS">("ALL_BATCH");
  const [formMeetingMode, setFormMeetingMode] = useState<"SCHEDULE" | "IMMEDIATE">("SCHEDULE");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentFilter, setStudentFilter] = useState("");

  // Fetch batches & courses
  const fetchInitialData = useCallback(async () => {
    if (isAuthLoading || !isAuthenticated) return;
    setIsLoading(true);
    try {
      const [fetchedBatches, fetchedCourses] = await Promise.all([
        isAdmin ? managementService.getBatches() : instructorService.getMyBatches(),
        isAdmin ? managementService.getCourses() : instructorService.getMyCourses(),
      ]);
      setBatches(fetchedBatches as Batch[]);
      setCourses(fetchedCourses);
    } catch (err) {
      console.error("Failed to load initial data:", err);
      toast.error("Failed to load batches or courses.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthLoading, isAuthenticated, isAdmin]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Create course-to-instructor mapping
  const courseInstructorMap = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((c) => {
      if (c.id && c.instructorId) {
        map.set(c.id, c.instructorId);
      }
    });
    return map;
  }, [courses]);

  // Filter batches based on RBAC logic
  const accessibleBatches = useMemo(() => {
    if (isAdmin) {
      return batches;
    }
    // If instructor, filter by batches where the batch's course belongs to the instructor, or the batch is assigned to the instructor explicitly
    return batches.filter((b) => {
      const instructorId = courseInstructorMap.get(b.courseId);
      return instructorId === user?.id || b.instructorId === user?.id;
    });
  }, [batches, isAdmin, courseInstructorMap, user]);

  // Fetch all meetings for all accessible batches and flatten
  const fetchAllMeetings = useCallback(async () => {
    if (accessibleBatches.length === 0) {
      setMeetings([]);
      return;
    }
    setIsMeetingsLoading(true);
    try {
      const meetingsPromises = accessibleBatches.map(async (batch) => {
        const batchMeetings = await liveClassesService.getMeetingsByBatch(batch.id);
        return batchMeetings.map((meeting) => ({
          ...meeting,
          batchName: batch.name,
        }));
      });

      const allMeetingsNested = await Promise.all(meetingsPromises);
      const allMeetings = allMeetingsNested.flat();
      // Sort by start time ascending
      allMeetings.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      setMeetings(allMeetings);
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
      toast.error("Failed to retrieve live classes.");
    } finally {
      setIsMeetingsLoading(false);
    }
  }, [accessibleBatches]);

  useEffect(() => {
    if (accessibleBatches.length > 0) {
      fetchAllMeetings();
    }
  }, [accessibleBatches, fetchAllMeetings]);

  // Fetch student roster when formBatchId changes and Audience is CUSTOM_STUDENTS
  useEffect(() => {
    if (formBatchId && formAudience === "CUSTOM_STUDENTS") {
      setIsRosterLoading(true);
      const fetchRoster = isAdmin 
        ? managementService.getBatchRoster(formBatchId) 
        : instructorService.getBatchRoster(formBatchId);
      
      fetchRoster
        .then((data) => {
          setRoster(data as BatchStudent[]);
          setSelectedStudentIds([]);
        })
        .catch((err) => {
          console.error("Failed to get batch roster:", err);
          toast.error("Could not load roster for batch.");
        })
        .finally(() => {
          setIsRosterLoading(false);
        });
    } else {
      setRoster([]);
      setSelectedStudentIds([]);
    }
  }, [formBatchId, formAudience, isAdmin]);

  // Categorize and filter meetings based on search & activeTab
  const filteredMeetings = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return meetings.filter((meeting) => {
      // Search matching
      const matchesSearch =
        meeting.title.toLowerCase().includes(query) ||
        (meeting.description && meeting.description.toLowerCase().includes(query)) ||
        (meeting.batchName && meeting.batchName.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Status tab matching
      // Upcoming: status is UPCOMING or CANCELLED is excluded (or included depending on UI, usually we omit CANCELLED or show it as completed/past. Let's show UPCOMING in Upcoming tab, LIVE in Live Now, COMPLETED or CANCELLED in Completed tab)
      if (activeTab === "upcoming") {
        return meeting.status === "UPCOMING";
      } else if (activeTab === "live") {
        return meeting.status === "LIVE";
      } else {
        return meeting.status === "COMPLETED" || meeting.status === "CANCELLED";
      }
    });
  }, [meetings, searchQuery, activeTab]);

  // Student toggle
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  // Handle Cancel meeting
  const handleCancelMeeting = async (id: string, title: string) => {
    const confirmCancel = window.confirm(`Are you sure you want to cancel the class "${title}"?`);
    if (!confirmCancel) return;

    try {
      await liveClassesService.updateStatus(id, "CANCELLED");
      toast.success(`Class "${title}" has been cancelled.`);
      await fetchAllMeetings();
    } catch (err) {
      const error = err as Error;
      console.error("Failed to cancel meeting:", error);
      toast.error(error.message || "Failed to cancel meeting.");
    }
  };

  // Handle Join as Host
  const handleJoinMeeting = async (meeting: LiveSession) => {
    if (!user) {
      toast.error("You must be logged in to join.");
      return;
    }

    try {
      const joinData = await liveClassesService.joinSession(meeting.id, {
        userId: user.id,
        name: user.name || "Host Instructor",
        role: "host",
      });

      toast.success("Joining meeting as host!");
      console.log("Dyte Host Token:", joinData.token);

      // Simulate launching or show alert with details
      alert(
        `[Dyte Integration] Initiating Dyte Meeting.\nMeeting ID: ${joinData.dyteMeetingId}\nHost Token: ${joinData.token.substring(0, 30)}...\n\nIn a full production environment, this token would load the <DyteMeeting> component in the UI.`,
      );
    } catch (err) {
      const error = err as Error;
      console.error("Failed to join meeting:", error);
      toast.error(error.message || "Failed to join session as host.");
    }
  };

  const handleStartMeeting = async (meeting: LiveSession) => {
    try {
      await liveClassesService.updateStatus(meeting.id, "LIVE");
      toast.success("Meeting is now LIVE.");
      await fetchAllMeetings();
      await handleJoinMeeting({ ...meeting, status: "LIVE" });
    } catch (err) {
      console.error("Failed to start meeting:", err);
      toast.error("Failed to start the meeting.");
    }
  };

  // Form submission
  const handleCreateMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formTitle || !formDuration || !formBatchId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formMeetingMode === "SCHEDULE" && (!formDate || !formTime)) {
      toast.error("Please provide date and time for scheduled session.");
      return;
    }

    if (formAudience === "CUSTOM_STUDENTS" && selectedStudentIds.length === 0) {
      toast.error("Please select at least one student for custom audience.");
      return;
    }

    setIsSubmitting(true);
    try {
      const combinedDateTime =
        formMeetingMode === "IMMEDIATE"
          ? new Date().toISOString()
          : new Date(`${formDate}T${formTime}:00`).toISOString();

      const createdMeeting = await liveClassesService.scheduleMeeting({
        title: formTitle,
        description: formDescription,
        startTime: combinedDateTime,
        duration: Number(formDuration),
        batchId: formBatchId,
        instructorId: user.id,
        type: formAudience,
        customStudentIds: formAudience === "CUSTOM_STUDENTS" ? selectedStudentIds : undefined,
      });

      if (formMeetingMode === "IMMEDIATE") {
        await liveClassesService.updateStatus(createdMeeting.id, "LIVE");
        toast.success(`Live Class "${formTitle}" started!`);
        await fetchAllMeetings();
        await handleJoinMeeting({ ...createdMeeting, status: "LIVE" });
      } else {
        toast.success(`Live Class "${formTitle}" scheduled successfully!`);
      }

      // Reset form
      setFormTitle("");
      setFormDescription("");
      setFormDate("");
      setFormTime("");
      setFormDuration(60);
      setFormBatchId("");
      setFormAudience("ALL_BATCH");
      setSelectedStudentIds([]);
      setShowCreateModal(false);

      // Refresh meetings list
      await fetchAllMeetings();
    } catch (err) {
      const error = err as Error;
      console.error("Failed to create meeting:", error);
      toast.error(error.message || "Failed to schedule live class.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter student checklist
  const filteredRoster = useMemo(() => {
    const filter = studentFilter.toLowerCase();
    return roster.filter((r) => {
      const name = r.student.name || "";
      const email = r.student.email || "";
      return name.toLowerCase().includes(filter) || email.toLowerCase().includes(filter);
    });
  }, [roster, studentFilter]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Verifying credentials and loading batches...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-[var(--hairline)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="hover:text-foreground cursor-pointer transition">
              {isAdmin ? "Admin panel" : "Instructor panel"}
            </span>
            <span>&gt;</span>
            <span className="text-foreground font-medium">Live Classes</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-display flex items-center gap-3">
            <Video className="h-7 w-7 text-blue-400" />
            Live Classes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule virtual classes, manage meetings, and track cohort sessions.
          </p>
        </div>

        {/* Buttons / Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllMeetings}
            disabled={isMeetingsLoading}
            className="p-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-muted-foreground hover:text-foreground transition disabled:opacity-50 cursor-pointer"
            title="Refresh Meetings"
          >
            <RefreshCw className={`h-4 w-4 ${isMeetingsLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary)] hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Meeting
          </button>
        </div>
      </div>

      {/* Tabs Menu & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--hairline)]">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/25 rounded-lg border border-[var(--hairline)] w-fit">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-md text-xs font-semibold tracking-wide uppercase transition duration-150 cursor-pointer ${
              activeTab === "upcoming"
                ? "bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold"
                : "border border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`px-4 py-2 rounded-md text-xs font-semibold tracking-wide uppercase transition duration-150 flex items-center gap-2 cursor-pointer ${
              activeTab === "live"
                ? "bg-red-500/10 border border-red-500/20 text-red-400 font-bold"
                : "border border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Live Now
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-md text-xs font-semibold tracking-wide uppercase transition duration-150 cursor-pointer ${
              activeTab === "completed"
                ? "bg-white/5 border border-white/10 text-foreground font-bold"
                : "border border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Completed / Past
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classes..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Main content grid */}
      {isMeetingsLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)]/50 animate-pulse space-y-4 shadow-md"
            >
              <div className="h-6 bg-white/[0.04] rounded w-2/3" />
              <div className="h-4 bg-white/[0.04] rounded w-1/3" />
              <div className="h-10 bg-white/[0.04] rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
          <Video className="h-12 w-12 text-muted-foreground/45 mb-3" />
          <h3 className="font-semibold text-lg text-foreground/80">No sessions found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? "Try resetting your search query."
              : `You have no ${activeTab} classes scheduled.`}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 text-sm transition cursor-pointer"
            >
              Schedule One Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`flex flex-col p-6 rounded-2xl border bg-[var(--surface)] hover:bg-[var(--surface-2)]/50 transition duration-300 group shadow-lg relative overflow-hidden ${
                meeting.status === "LIVE"
                  ? "border-red-500/30 shadow-red-500/5"
                  : "border-[var(--hairline)]"
              }`}
            >
              {meeting.status === "LIVE" && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500 animate-pulse" />
              )}
              {meeting.status === "CANCELLED" && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-10 select-none pointer-events-none">
                  <span className="px-4 py-1.5 rounded-full border border-red-500/30 bg-red-950/80 text-red-400 text-xs font-bold uppercase tracking-widest shadow-md">
                    Cancelled
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[17px] text-foreground truncate group-hover:text-blue-400 transition flex items-center gap-2">
                    {meeting.status === "LIVE" && (
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    )}
                    {meeting.title}
                  </h3>
                  <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold bg-white/[0.04] text-muted-foreground rounded border border-[var(--hairline)]">
                    Cohort: {meeting.batchName || "N/A"}
                  </span>
                </div>

                {/* Type Badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    meeting.type === "CUSTOM_STUDENTS"
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {meeting.type === "CUSTOM_STUDENTS" ? "Specific Students" : "Entire Batch"}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mt-3 line-clamp-2 min-h-[32px]">
                {meeting.description || "No session description provided."}
              </p>

              {/* Details */}
              <div className="space-y-2 mt-5 flex-1 border-t border-b border-[var(--hairline)] py-4 my-4">
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4 text-blue-400/80 shrink-0" />
                  <span className="text-foreground/95 font-medium">
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
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Clock className="h-4 w-4 text-purple-400/80 shrink-0" />
                  <span>
                    Duration:{" "}
                    <strong className="text-foreground/90 font-semibold">
                      {meeting.duration} mins
                    </strong>
                  </span>
                </div>
                {meeting.type === "CUSTOM_STUDENTS" && meeting.allowedStudents && (
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Users className="h-4 w-4 text-indigo-400/80 shrink-0" />
                    <span>
                      Audience:{" "}
                      <strong className="text-foreground/90 font-semibold">
                        {meeting.allowedStudents.length} student(s)
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-2 mt-2">
                {meeting.status === "LIVE" ? (
                  <button
                    onClick={() => handleJoinMeeting(meeting)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/20 transition active:scale-[0.98] cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Join as Host
                  </button>
                ) : meeting.status === "UPCOMING" ? (
                  <>
                    <div className="flex w-full flex-col gap-2">
                      <button
                        onClick={() => handleStartMeeting(meeting)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition active:scale-[0.98] cursor-pointer"
                      >
                        <Play className="h-4 w-4" />
                        Start Meeting
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            toast.info(
                              "Edit Live Class is currently simulated. Use Cancel to recreate.",
                              {
                                description:
                                  "To change meeting parameters, cancel the current class and schedule a new session.",
                                duration: 4000,
                              },
                            )
                          }
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleCancelMeeting(meeting.id, meeting.title)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-semibold text-rose-400 hover:text-rose-300 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full text-center text-xs text-muted-foreground italic py-1 border border-dashed border-[var(--hairline)] rounded-lg">
                    {meeting.status === "CANCELLED" ? "Session Cancelled" : "Session Completed"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MEETING MODAL DIALOG */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          {/* Modal Container */}
          <div className="relative w-full max-w-lg p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-2xl space-y-5 animate-scale-in max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start shrink-0">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground font-display flex items-center gap-2">
                  <Video className="h-5 w-5 text-blue-400" />
                  Schedule Live Class
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Fill in the details to generate a Dyte meeting space for your cohort.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-muted-foreground hover:text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form - Scrollable */}
            <form
              onSubmit={handleCreateMeetingSubmit}
              className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-thin"
            >
              {/* Mode Toggle */}
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer select-none">
                  <input
                    type="radio"
                    name="meetingMode"
                    checked={formMeetingMode === "SCHEDULE"}
                    onChange={() => setFormMeetingMode("SCHEDULE")}
                    className="accent-blue-500"
                  />
                  <span>Schedule Session</span>
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer select-none">
                  <input
                    type="radio"
                    name="meetingMode"
                    checked={formMeetingMode === "IMMEDIATE"}
                    onChange={() => setFormMeetingMode("IMMEDIATE")}
                    className="accent-blue-500"
                  />
                  <span className="text-emerald-400">Start Immediate Class</span>
                </label>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Class Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Live Q&A Session on Async JavaScript"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 transition text-foreground"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  placeholder="Provide an overview of topics covered or resources required..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 transition text-foreground resize-none"
                />
              </div>

              {/* Date, Time & Duration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {formMeetingMode === "SCHEDULE" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Date *</label>
                      <input
                        type="date"
                        required
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Time *</label>
                      <input
                        type="time"
                        required
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground"
                      />
                    </div>
                  </>
                )}
                <div
                  className={`space-y-1.5 ${formMeetingMode === "IMMEDIATE" ? "sm:col-span-3" : ""}`}
                >
                  <label className="text-xs font-semibold text-muted-foreground">
                    Duration (mins) *
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={360}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground font-mono"
                  />
                </div>
              </div>

              {/* Batch Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Select Batch / Cohort *
                </label>
                <div className="relative">
                  <select
                    required
                    value={formBatchId}
                    onChange={(e) => setFormBatchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-blue-500 transition text-foreground appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      -- Choose Recipient Cohort --
                    </option>
                    {accessibleBatches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} ({batch.code})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                {accessibleBatches.length === 0 && !isLoading && (
                  <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    No active batches available. Create a batch first.
                  </p>
                )}
              </div>

              {/* Audience selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Audience Target *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="radio"
                      name="audienceType"
                      checked={formAudience === "ALL_BATCH"}
                      onChange={() => setFormAudience("ALL_BATCH")}
                      className="accent-blue-500 cursor-pointer"
                    />
                    <span>Entire Batch</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="radio"
                      name="audienceType"
                      checked={formAudience === "CUSTOM_STUDENTS"}
                      onChange={() => setFormAudience("CUSTOM_STUDENTS")}
                      className="accent-blue-500 cursor-pointer"
                      disabled={!formBatchId}
                    />
                    <span className={!formBatchId ? "text-muted-foreground/60" : ""}>
                      Specific Students
                    </span>
                  </label>
                </div>
              </div>

              {/* Specific student checklist */}
              {formAudience === "CUSTOM_STUDENTS" && formBatchId && (
                <div className="space-y-2 border border-[var(--hairline)] rounded-xl p-3 bg-black/15">
                  <div className="flex justify-between items-center pb-2 border-b border-[var(--hairline)]">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-indigo-400" />
                      Select Roster Students
                    </span>
                    <span className="text-[10px] font-mono bg-white/[0.04] px-1.5 py-0.5 rounded border border-[var(--hairline)] text-muted-foreground">
                      Selected: {selectedStudentIds.length}
                    </span>
                  </div>

                  {/* Student search filter */}
                  <div className="relative mt-2 shrink-0">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/70" />
                    <input
                      type="text"
                      value={studentFilter}
                      onChange={(e) => setStudentFilter(e.target.value)}
                      placeholder="Filter cohort students..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[var(--hairline)] bg-[var(--surface-2)] text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 transition text-foreground"
                    />
                  </div>

                  {/* Scrollable list */}
                  <div className="max-h-[160px] overflow-y-auto mt-2 space-y-1 pr-1 scrollbar-thin">
                    {isRosterLoading ? (
                      <div className="p-4 text-center text-xs text-muted-foreground animate-pulse">
                        Fetching batch roster students...
                      </div>
                    ) : filteredRoster.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        {studentFilter
                          ? "No matches found."
                          : "No students enrolled in this batch."}
                      </div>
                    ) : (
                      filteredRoster.map((r) => {
                        const isSelected = selectedStudentIds.includes(r.studentId);
                        return (
                          <div
                            key={r.id}
                            onClick={() => toggleStudentSelection(r.studentId)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition select-none ${
                              isSelected
                                ? "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                                : "hover:bg-[var(--surface-2)] border border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <div
                              className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition ${
                                isSelected
                                  ? "bg-blue-500 border-blue-500 text-white"
                                  : "border-muted-foreground/50 bg-[var(--surface)]"
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold truncate text-foreground flex items-center gap-2">
                                <span>{r.student.name || "Unnamed Student"}</span>
                                {accessibleBatches.find((b) => b.id === formBatchId)?.code && (
                                  <span className="text-[9px] font-mono bg-white/[0.04] px-1.5 py-0.5 rounded border border-[var(--hairline)] text-muted-foreground">
                                    {accessibleBatches.find((b) => b.id === formBatchId)?.code}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] opacity-75 truncate">
                                {r.student.email}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-sm font-semibold text-foreground hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || accessibleBatches.length === 0}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-md hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                    formMeetingMode === "IMMEDIATE"
                      ? "bg-emerald-600 shadow-emerald-600/20"
                      : "bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary)]"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      {formMeetingMode === "IMMEDIATE" ? "Starting..." : "Scheduling..."}
                    </>
                  ) : formMeetingMode === "IMMEDIATE" ? (
                    <>
                      <Play className="h-4 w-4" />
                      Start Immediate Class Now
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4" />
                      Schedule Live Class
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
