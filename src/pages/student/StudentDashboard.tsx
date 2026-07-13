import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
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
  Play,
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { studentService, type StudentEnrollment } from "@/infrastructure/student/studentService";
import { managementService, type Batch } from "@/infrastructure/admin/managementService";
import { liveClassesService, type LiveSession } from "@/infrastructure/admin/liveClassesService";
import type { Course } from "@/domain/course";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";

export function StudentDashboard() {
  const glow = useAccentRgb();
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
        const [fetchedEnrollments, fetchedBatches, fetchedMeetings, fetchedCourses] =
          await Promise.all([
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
          <RefreshCw className="h-8 w-8 text-[var(--accent-cyan)] animate-spin" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Gathering your progress and schedule...
          </p>
        </div>
      </div>
    );
  }

  const enrolledCount = enrollments.length;
  const activeBatchesCount = batches.length;
  const completedCourses = enrollments.filter(
    (e) => e.isCompleted || e.completedPercent >= 100,
  ).length;

  const averageProgress =
    enrolledCount > 0
      ? Math.round(
          enrollments.reduce((acc, curr) => acc + curr.completedPercent, 0) / enrolledCount,
        )
      : 0;

  const activeLiveNow = meetings.filter((m) => m.status === "LIVE");
  const upcomingMeetings = meetings.filter((m) => m.status === "UPCOMING").slice(0, 3);

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
    <main className="relative flex-1 w-full overflow-hidden bg-background py-8 md:py-12">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 space-y-8 md:space-y-12">
        {/* Welcome Section */}
        <MagicBentoCard
          className="group relative flex flex-col md:flex-row md:items-center justify-between gap-8 rounded-2xl border border-border bg-card p-6 md:p-10 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)] overflow-hidden"
          glowColor={glow}
          enableStars
        >
          {/* Decorative background similar to ChallengesSection image block */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--accent-cyan)]/10 blur-[100px] transition-all duration-500 group-hover:bg-[var(--accent-cyan)]/25 group-hover:scale-125" />
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
              backgroundSize: "12px 12px",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-[var(--accent-cyan)] md:mb-6 md:text-[10px]">
                <span className="size-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                v2.0 — student portal
              </div>
              <h2 className="font-mono text-3xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Welcome back,
                <br />
                <span className="text-[var(--accent-cyan)] drop-shadow-[0_0_24px_var(--accent-cyan)]">
                  {user?.name || "Student"}! 👋
                </span>
              </h2>
              <p className="mt-5 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm md:mt-6 md:text-base">
                Here is an overview of your cohort learning journey, live sessions timeline, and
                course completions. Keep learning!
              </p>
            </div>
            {activeLiveNow.length > 0 && (
              <Link
                to={`/meetings/${activeLiveNow[0].id}`}
                className="group/btn inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-all hover:scale-[1.02] hover:shadow-[0_0_32px_var(--accent-cyan)] md:px-6 md:text-xs shrink-0"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-background animate-pulse" />
                <span>Join Active Session ({activeLiveNow.length} Live Now)</span>
                <span className="transition-transform group-hover/btn:translate-x-1">→</span>
              </Link>
            )}
          </div>
        </MagicBentoCard>

        {/* Stats Grid */}
        <MagicBentoSection className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" glowColor={glow}>
          <MagicBentoCard
            className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)] animate-fade-in"
            glowColor={glow}
            enableTilt
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-cyan)]/10 to-[var(--accent-violet)]/10 text-[var(--accent-cyan)] group-hover:text-[var(--accent-violet)] transition-colors duration-300 border border-[var(--accent-cyan)]/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="mt-5">
              <div className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase font-mono">
                Courses Enrolled
              </div>
              <div className="text-left text-3xl font-bold leading-tight text-foreground group-hover:text-[var(--accent-cyan)] transition-colors mt-2">
                {enrolledCount}
              </div>
            </div>
          </MagicBentoCard>

          <MagicBentoCard
            className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)] animate-fade-in"
            glowColor={glow}
            enableTilt
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-violet)]/10 to-[var(--accent-cyan)]/10 text-[var(--accent-violet)] group-hover:text-[var(--accent-cyan)] transition-colors duration-300 border border-[var(--accent-violet)]/20">
              <Layers className="h-5 w-5" />
            </div>
            <div className="mt-5">
              <div className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase font-mono">
                Cohort Batches
              </div>
              <div className="text-left text-3xl font-bold leading-tight text-foreground group-hover:text-[var(--accent-cyan)] transition-colors mt-2">
                {activeBatchesCount}
              </div>
            </div>
          </MagicBentoCard>

          <MagicBentoCard
            className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)] animate-fade-in"
            glowColor={glow}
            enableTilt
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-cyan)]/10 to-[var(--accent-violet)]/10 text-[var(--accent-cyan)] group-hover:text-[var(--accent-violet)] transition-colors duration-300 border border-[var(--accent-cyan)]/20">
              <Award className="h-5 w-5" />
            </div>
            <div className="mt-5">
              <div className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase font-mono">
                Certificates Earned
              </div>
              <div className="text-left text-3xl font-bold leading-tight text-foreground group-hover:text-[var(--accent-cyan)] transition-colors mt-2">
                {completedCourses}
              </div>
            </div>
          </MagicBentoCard>

          <MagicBentoCard
            className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)] animate-fade-in"
            glowColor={glow}
            enableTilt
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-violet)]/10 to-[var(--accent-cyan)]/10 text-[var(--accent-violet)] group-hover:text-[var(--accent-cyan)] transition-colors duration-300 border border-[var(--accent-violet)]/20">
              <Clock className="h-5 w-5" />
            </div>
            <div className="mt-5">
              <div className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase font-mono">
                Average Progress
              </div>
              <div className="text-left text-3xl font-bold leading-tight text-foreground group-hover:text-[var(--accent-cyan)] transition-colors mt-2">
                {averageProgress}%
              </div>
            </div>
          </MagicBentoCard>
        </MagicBentoSection>

        {/* Content Section */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Learning */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-left text-xl font-bold leading-tight text-foreground flex items-center gap-3">
                <PlayCircle className="h-6 w-6 text-[var(--accent-cyan)]" />
                Recent Learning
              </h3>
              <Link
                to="/student/profile"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--accent-cyan)] transition-all hover:translate-x-0.5 hover:underline uppercase tracking-[0.2em] font-mono"
              >
                View All Enrolled <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {enrolledCoursesList.length === 0 ? (
              <article className="group relative flex flex-col rounded-2xl border border-dashed border-border bg-card/10 p-12 text-center transition-all hover:border-[var(--accent-cyan)]/50 hover:bg-[var(--accent-cyan)]/5 items-center justify-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/45 mb-4 group-hover:text-[var(--accent-cyan)]/60 transition-colors" />
                <div className="font-bold text-base text-foreground/80 font-mono tracking-tight">
                  NOT ENROLLED IN ANY COURSES
                </div>
                <p className="mt-2 text-sm text-muted-foreground max-w-[280px]">
                  Browse the marketplace to find and enroll in structured bootcamps.
                </p>
                <Link
                  to="/student/courses"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.02] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/90 transition-colors hover:border-[var(--accent-cyan)]/40 hover:text-[var(--accent-cyan)] md:px-6 md:text-xs"
                >
                  Explore Courses
                </Link>
              </article>
            ) : (
              <MagicBentoSection className="grid gap-5" glowColor={glow}>
                {enrolledCoursesList.slice(0, 3).map((enroll) => (
                  <MagicBentoCard
                    key={enroll.id}
                    className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)] sm:flex-row sm:items-center justify-between gap-5"
                    glowColor={glow}
                    enableTilt
                  >
                    <div className="min-w-0 flex-1 space-y-3">
                      <h4 className="text-left text-lg font-bold leading-tight text-foreground group-hover:text-[var(--accent-cyan)] transition-colors truncate">
                        {enroll.course?.title}
                      </h4>
                      <div className="flex items-center gap-5 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
                          <span>Level: {enroll.course?.level || "Beginner"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>Price Paid: ${enroll.pricePaid}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-1 max-w-md">
                        <div className="h-1.5 flex-1 bg-foreground/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] rounded-full transition-all duration-500"
                            style={{ width: `${enroll.completedPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground font-mono tracking-wider w-8 text-right">
                          {Math.round(enroll.completedPercent)}%
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/student/profile`}
                      className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-foreground transition-all hover:bg-gradient-to-r hover:from-[var(--accent-cyan)] hover:to-[var(--accent-violet)] hover:text-background hover:scale-105 shadow-md"
                      aria-label={`Resume ${enroll.course?.title}`}
                    >
                      <Play className="h-5 w-5 fill-current ml-1" />
                    </Link>
                  </MagicBentoCard>
                ))}
              </MagicBentoSection>
            )}
          </div>

          {/* Live Classes Schedule */}
          <div className="space-y-6">
            <h3 className="text-left text-xl font-bold leading-tight text-foreground flex items-center gap-3">
              <Calendar className="h-6 w-6 text-[var(--accent-violet)]" />
              Live Classes Schedule
            </h3>

            <MagicBentoCard
              className="group/schedule relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-[var(--accent-violet)] hover:shadow-[0_0_30px_-10px_var(--accent-violet)] space-y-6"
              glowColor={glow}
              enableStars={false}
            >
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center gap-3">
                  <Video className="h-10 w-10 text-muted-foreground/30 group-hover/schedule:text-[var(--accent-violet)]/50 transition-colors" />
                  <span className="text-[10px] font-mono uppercase tracking-widest">
                    No upcoming classes.
                  </span>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border group-hover/schedule:before:bg-[var(--accent-violet)]/20 before:transition-colors">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="relative pl-8 space-y-1.5 group/item">
                      {/* Timeline dot */}
                      <div className="absolute left-[7px] top-1.5 h-2.5 w-2.5 rounded-full bg-border shadow-sm ring-4 ring-card transition-all group-hover/item:scale-125 group-hover/item:bg-[var(--accent-violet)] group-hover/item:shadow-[0_0_12px_var(--accent-violet)] group-hover/item:ring-[var(--accent-violet)]/20" />

                      <div className="text-[10px] font-mono text-muted-foreground group-hover/item:text-[var(--accent-violet)] font-bold uppercase tracking-wider transition-colors">
                        {new Date(meeting.startTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(
                          new Date(meeting.startTime).getTime() + meeting.duration * 60000,
                        ).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover/item:text-[var(--accent-violet)] transition-colors">
                        {meeting.title}
                      </h4>
                      <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                        Batch: {meeting.batchName || "Cohort"} • {meeting.duration}m
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link
                to="/student/live-classes"
                className="mt-2 group/btn inline-flex w-full items-center justify-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.02] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/90 transition-colors hover:border-[var(--accent-violet)]/40 hover:text-[var(--accent-violet)]"
              >
                <span>Manage Live Rooms</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </MagicBentoCard>
          </div>
        </div>
      </div>
    </main>
  );
}
