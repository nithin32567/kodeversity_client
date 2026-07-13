import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  BookOpen,
  Layers,
  Users,
  Video,
  Plus,
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  RefreshCw,
  Award,
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { instructorService } from "@/infrastructure/instructor/instructorService";
import type { Course } from "@/domain/course";
import type { InstructorBatch } from "@/infrastructure/instructor/instructorService";
import { liveClassesService } from "@/infrastructure/admin/liveClassesService";
import { toast } from "sonner";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";

export function InstructorDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const glow = useAccentRgb();

  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<InstructorBatch[]>([]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [meetingCount, setMeetingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [fetchedCourses, fetchedBatches] = await Promise.all([
        instructorService.getMyCourses(),
        instructorService.getMyBatches(),
      ]);

      const myCourses = fetchedCourses.filter((c) => c.instructorId === user?.id);
      setCourses(myCourses);

      const myCourseIds = new Set(myCourses.map((c) => c.id));
      const myBatches = fetchedBatches.filter(
        (b) => myCourseIds.has(b.courseId) || b.instructorId === user?.id,
      );
      setBatches(myBatches);

      const [rosters, meetings] = await Promise.all([
        Promise.all(myBatches.map((b) => instructorService.getBatchRoster(b.id))),
        Promise.all(myBatches.map((b) => liveClassesService.getMeetingsByBatch(b.id))),
      ]);

      const uniqueStudents = new Set<string>();
      rosters.flat().forEach((r) => uniqueStudents.add(r.studentId));
      setStudentCount(uniqueStudents.size);

      setMeetingCount(meetings.flat().length);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      toast.error("Error loading dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthLoading || !user) return;
    void fetchDashboardData();
  }, [isAuthLoading, user, fetchDashboardData]);

  if (isAuthLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Syncing your instructor profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-[1400px] mx-auto w-full">
      {}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-6 sm:p-8 shadow-xl">
        <div
          className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full blur-[90px] opacity-10"
          style={{ background: "var(--grad-purple)" }}
        />
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Welcome back, {user?.name || "Instructor"}!
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Manage your courses, coordinate cohorts, organize interactive live sessions, and track
            student success metrics from a single dashboard.
          </p>
        </div>
      </div>

      {}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          glow={glow}
          icon={<BookOpen className="h-5 w-5 text-purple-400" />}
          title="Assigned Courses"
          value={courses.length}
          desc="Curriculum catalog pieces"
        />
        <StatCard
          glow={glow}
          icon={<Layers className="h-5 w-5 text-indigo-400" />}
          title="Active Batches"
          value={batches.filter((b) => b.status === "ACTIVE").length}
          desc="Cohorts actively running"
        />
        <StatCard
          glow={glow}
          icon={<Users className="h-5 w-5 text-emerald-400" />}
          title="Students Managed"
          value={studentCount}
          desc="Total enrolled students"
        />
        <StatCard
          glow={glow}
          icon={<Video className="h-5 w-5 text-rose-400" />}
          title="Meetings Conducted"
          value={meetingCount}
          desc="Interactive video sessions"
        />
      </div>

      {}
      <MagicBentoSection
        className="grid gap-6 lg:grid-cols-3"
        glowColor={glow}
        spotlightRadius={450}
      >
        {}
        <MagicBentoCard
          className="lg:col-span-1 p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] flex flex-col justify-between"
          glowColor={glow}
          enableStars={false}
          enableMagnetism={false}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white font-display">LMS Core Actions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quick shortcuts to manage curriculum operations.
              </p>
            </div>

            <div className="space-y-2.5">
              <Link
                to="/instructor/courses"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] hover:border-white/[0.08] transition text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  Course Content Builder
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                to="/instructor/meetings"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] hover:border-white/[0.08] transition text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-rose-400" />
                  Schedule Live Meeting
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                to="/instructor/batches"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)] hover:border-white/[0.08] transition text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  Cohort Batches Roster
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--hairline)] mt-4">
            <button
              onClick={() => void navigate("/instructor/courses")}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Create Course Module
            </button>
          </div>
        </MagicBentoCard>

        {}
        <MagicBentoCard
          className="lg:col-span-2 p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] flex flex-col justify-between"
          glowColor={glow}
          enableStars={false}
          enableMagnetism={false}
        >
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-display">Assigned Bootcamps</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your registered curriculum programs.
                </p>
              </div>
              <Link to="/instructor/courses" className="text-xs text-purple-400 hover:underline">
                View All
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <h4 className="font-semibold text-sm text-foreground/80">No courses assigned</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reach out to administration to assign curriculum pieces.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 max-h-[220px] overflow-y-auto pr-1">
                {courses.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)]/60 transition flex flex-col justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-white line-clamp-1">{c.title}</h4>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                        {c.subtitle || "Expert engineering track"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400 uppercase font-semibold">
                        {c.level || "Beginner"}
                      </span>
                      <Link
                        to={`/instructor/courses/${c.title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "")}`}
                        className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-[var(--surface-2)] border border-[var(--hairline)] hover:bg-[var(--surface)] px-2 py-1 rounded text-muted-foreground transition"
                      >
                        Builder <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </MagicBentoCard>
      </MagicBentoSection>
    </main>
  );
}

function StatCard({
  glow,
  icon,
  title,
  value,
  desc,
}: {
  glow: string;
  icon: React.ReactNode;
  title: string;
  value: number | string;
  desc: string;
}) {
  return (
    <MagicBentoCard
      className="p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] space-y-3 relative overflow-hidden"
      glowColor={glow}
      enableStars={false}
      enableMagnetism={false}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-semibold">{title}</span>
        <div className="p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)]">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-extrabold text-white font-mono">{value}</h3>
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
          {desc}
        </p>
      </div>
    </MagicBentoCard>
  );
}
