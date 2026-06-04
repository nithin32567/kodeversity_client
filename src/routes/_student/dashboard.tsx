import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Layers,
  Award,
  Clock,
  PlayCircle,
  Video,
  Calendar,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { studentService, type StudentEnrollment } from "@/infrastructure/student/studentService";
import { managementService, type Batch } from "@/infrastructure/admin/managementService";
import { liveClassesService, type LiveSession } from "@/infrastructure/admin/liveClassesService";
import type { Course } from "@/domain/course";

export const Route = createFileRoute("/_student/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Kodeversity" }] }),
  component: StudentDashboard,
});

export function StudentDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [meetings, setMeetings] = useState<LiveSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading || !user) return;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [fetchedEnrollments, fetchedBatches, fetchedMeetings, fetchedCourses] = await Promise.all([
          studentService.getStudentEnrollments(user.id),
          studentService.getMyBatches(user.id),
          studentService.getMyLiveClasses(user.id),
          managementService.getCourses(),
        ]);
        setEnrollments(fetchedEnrollments);
        setBatches(fetchedBatches);
        setMeetings(fetchedMeetings);
        setCourses(fetchedCourses);
      } catch (err) {
        console.error("Failed to load student dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, [isAuthLoading, user]);

  if (isAuthLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Gathering your progress and schedule...</p>
        </div>
      </div>
    );
  }

  // Aggregate metrics
  const enrolledCount = enrollments.length;
  const activeBatchesCount = batches.length;
  const completedCourses = enrollments.filter((e) => e.isCompleted || e.completedPercent >= 100).length;
  
  // Calculate average progress
  const averageProgress =
    enrolledCount > 0
      ? Math.round(enrollments.reduce((acc, curr) => acc + curr.completedPercent, 0) / enrolledCount)
      : 0;

  // Filter meetings that are upcoming or live
  const activeLiveNow = meetings.filter((m) => m.status === "LIVE");
  const upcomingMeetings = meetings.filter((m) => m.status === "UPCOMING").slice(0, 3);

  // Map courses with student enrollments for display
  const enrolledCoursesList = enrollments
    .map((enroll) => {
      const course = courses.find((c) => c.id === enroll.courseId);
      return {
        ...enroll,
        course,
      };
    })
    .filter((e) => e.course !== undefined);

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-xl">
        <div
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-[100px] opacity-15"
          style={{ background: "var(--grad-cta)" }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl font-display">
              Welcome back, {user?.name || "Student"}! 👋
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Here is an overview of your cohort learning journey, live sessions timeline, and course completions. Keep learning!
            </p>
          </div>
          {activeLiveNow.length > 0 && (
            <Link
              to="/live-classes"
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/10 active:scale-[0.98] transition cursor-pointer"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
              <span>Join Active Session ({activeLiveNow.length} Live Now)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Grid Metrics Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/30 transition shadow-lg flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 grid place-items-center shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Courses Enrolled</div>
            <div className="text-2xl font-bold font-display mt-0.5">{enrolledCount}</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/30 transition shadow-lg flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 grid place-items-center shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Cohort Batches</div>
            <div className="text-2xl font-bold font-display mt-0.5">{activeBatchesCount}</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/30 transition shadow-lg flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 grid place-items-center shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Certificates Earned</div>
            <div className="text-2xl font-bold font-display mt-0.5">{completedCourses}</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/30 transition shadow-lg flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 grid place-items-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Average Progress</div>
            <div className="text-2xl font-bold font-display mt-0.5">{averageProgress}%</div>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: My Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight font-display flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-indigo-400" />
              Recent Learning
            </h3>
            <Link
              to="/profile"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
            >
              View All Enrolled
            </Link>
          </div>

          {enrolledCoursesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/5 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/45 mb-2" />
              <div className="font-semibold text-sm text-foreground/80">Not enrolled in any courses</div>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                Browse the marketplace to find and enroll in structured bootcamps.
              </p>
              <Link
                to="/courses"
                className="mt-4 px-4 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-xs font-semibold transition"
              >
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {enrolledCoursesList.slice(0, 3).map((enroll) => (
                <div
                  key={enroll.id}
                  className="p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/30 transition duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {enroll.course?.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      Level: {enroll.course?.level || "Beginner"} • pricePaid: ${enroll.pricePaid}
                    </p>
                    <div className="flex items-center gap-2.5 pt-1.5 max-w-[280px]">
                      <div className="h-1.5 flex-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${enroll.completedPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {Math.round(enroll.completedPercent)}%
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/profile`}
                    className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--hairline)] bg-[var(--surface-2)]/60 hover:bg-[var(--surface-2)] text-foreground hover:text-white transition"
                  >
                    <span>Resume</span>
                    <PlayCircle className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Upcoming Meetings / Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight font-display flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            Live Classes Schedule
          </h3>

          <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] space-y-5">
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Video className="h-8 w-8 text-muted-foreground/45" />
                <span className="text-xs">No upcoming classes scheduled.</span>
              </div>
            ) : (
              <div className="space-y-5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-[var(--hairline)]">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="relative pl-7 space-y-1">
                    {/* Time dot */}
                    <div className="absolute left-[9px] top-1.5 h-2 w-2 rounded-full bg-purple-400 shadow-md ring-4 ring-[var(--surface)]" />

                    <div className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                      {new Date(meeting.startTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      - {new Date(new Date(meeting.startTime).getTime() + meeting.duration * 60000).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    <h4 className="font-bold text-xs text-foreground line-clamp-1">{meeting.title}</h4>
                    <div className="text-[10px] text-muted-foreground">
                      Batch: {meeting.batchName || "Cohort"} • {meeting.duration}m
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View Full Timeline Button */}
            <Link
              to="/live-classes"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)] text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <span>Manage Live Rooms</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
