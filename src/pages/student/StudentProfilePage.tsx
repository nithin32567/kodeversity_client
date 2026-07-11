import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  RefreshCw,
  Clock,
  ExternalLink,
  PlayCircle,
  Play,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { studentService, type StudentEnrollment } from "@/infrastructure/student/studentService";
import { managementService } from "@/infrastructure/admin/managementService";
import type { Course } from "@/domain/course";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";

export function StudentProfilePage() {
  const glow = useAccentRgb();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [profileDetail, setProfileDetail] = useState<{
    phone?: string | null;
    highestQualification?: string | null;
    createdAt?: string;
  } | null>(null);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading || !user) return;

    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [students, fetchedCourses] = await Promise.all([
          studentService.getStudents(),
          managementService.getCourses(),
        ]);

        const matchedStudent = students.find((s) => s.id === user.id);
        if (matchedStudent) {
          setProfileDetail({
            phone: (matchedStudent as { phone?: string | null }).phone || null,
            highestQualification:
              (matchedStudent as { highestQualification?: string | null }).highestQualification ||
              null,
            createdAt: (matchedStudent as { createdAt?: string }).createdAt,
          });
          setEnrollments(matchedStudent.enrolledCourses || []);
        } else {
          const fallbackEnrollments = await studentService.getStudentEnrollments(user.id);
          setEnrollments(fallbackEnrollments);
        }
        setCourses(fetchedCourses);
      } catch (err) {
        console.error("Failed to load profile details:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadProfileData();
  }, [isAuthLoading, user]);

  if (isAuthLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-[var(--accent-cyan)] animate-spin" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Loading your profile information...</p>
        </div>
      </div>
    );
  }

  const purchasedCourses = enrollments
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
        {/* Profile Header Bento Card */}
        <MagicBentoCard
          className="group relative flex flex-col md:flex-row gap-6 items-start md:items-center rounded-2xl border border-border bg-card p-6 md:p-10 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)] overflow-hidden"
          glowColor={glow}
          enableStars
        >
          {/* Background Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
              backgroundSize: "12px 12px",
            }}
          />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--accent-cyan)]/10 blur-[100px] transition-all duration-500 group-hover:bg-[var(--accent-cyan)]/25 group-hover:scale-125" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center w-full">
            {/* Avatar */}
            <div
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-full grid place-items-center text-background text-3xl font-mono font-bold border border-white/20 shadow-[0_0_30px_var(--accent-cyan)] shrink-0"
              style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))" }}
            >
              {user?.name
                ? user.name
                    .trim()
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                : "ST"}
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-[var(--accent-cyan)]">
                  <span className="size-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                  Role: {user?.role || "STUDENT"}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-mono">
                  {user?.name || "Student Name"}
                </h2>
              </div>

              {/* Details Grid */}
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-2 max-w-3xl pt-2 font-mono text-[10px] uppercase tracking-widest">
                <div className="flex items-center gap-3 text-muted-foreground group/item hover:text-foreground transition-colors">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] group-hover/item:bg-[var(--accent-cyan)]/20 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground group/item hover:text-foreground transition-colors">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-violet)]/10 border border-[var(--accent-violet)]/20 text-[var(--accent-violet)] group-hover/item:bg-[var(--accent-violet)]/20 transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="truncate">
                    {profileDetail?.phone || "+91 XXXXX XXXXX"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground group/item hover:text-foreground transition-colors">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] group-hover/item:bg-[var(--accent-cyan)]/20 transition-colors">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span className="truncate">
                    {profileDetail?.highestQualification || "Not Specified"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground group/item hover:text-foreground transition-colors">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-violet)]/10 border border-[var(--accent-violet)]/20 text-[var(--accent-violet)] group-hover/item:bg-[var(--accent-violet)]/20 transition-colors">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="truncate">
                    Registered:{" "}
                    {profileDetail?.createdAt
                      ? new Date(profileDetail.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "June 2026"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </MagicBentoCard>

        {/* Purchased Courses Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight font-mono uppercase flex items-center gap-3 text-foreground">
                <BookOpen className="h-6 w-6 text-[var(--accent-cyan)]" />
                Purchased Courses ({purchasedCourses.length})
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2">
                Your enrolled bootcamps, courses, and progress.
              </p>
            </div>
          </div>

          {purchasedCourses.length === 0 ? (
            <article className="group relative flex flex-col rounded-2xl border border-dashed border-border bg-card/10 p-16 text-center transition-all hover:border-[var(--accent-cyan)]/50 hover:bg-[var(--accent-cyan)]/5 items-center justify-center">
              <Award className="h-12 w-12 text-muted-foreground/45 mb-4 group-hover:text-[var(--accent-cyan)]/60 transition-colors" />
              <h3 className="font-bold text-base text-foreground/80 font-mono tracking-tight uppercase">No active purchases found</h3>
              <p className="text-[10px] font-mono tracking-widest text-muted-foreground mt-2 max-w-sm uppercase">
                It seems you haven't bought or registered in any courses yet.
              </p>
              <Link
                to="/student/courses"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.02] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/90 transition-colors hover:border-[var(--accent-cyan)]/40 hover:text-[var(--accent-cyan)]"
              >
                Browse Course Catalog <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ) : (
            <MagicBentoSection className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" glowColor={glow}>
              {purchasedCourses.map((enroll) => (
                <MagicBentoCard
                  key={enroll.id}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)]"
                  glowColor={glow}
                  enableTilt
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video rounded-xl border border-border overflow-hidden shrink-0 bg-gradient-to-br from-[var(--accent-cyan)]/5 to-[var(--accent-violet)]/5">
                    {enroll.course?.thumbnailUrl ? (
                      <img
                        src={enroll.course.thumbnailUrl}
                        alt={enroll.course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 mix-blend-luminosity group-hover:mix-blend-normal"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-[var(--accent-cyan)]/50" />
                      </div>
                    )}
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md text-white rounded-full border border-white/20">
                      {enroll.course?.level || "Beginner"}
                    </span>
                  </div>

                  {/* Course Info */}
                  <div className="mt-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg leading-tight text-foreground line-clamp-1 group-hover:text-[var(--accent-cyan)] transition-colors">
                        {enroll.course?.title}
                      </h4>
                      <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground line-clamp-2">
                        {enroll.course?.subtitle || "Self-paced expert curriculum program."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-border/60 text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[var(--accent-violet)]" />
                        <span>{enroll.course?.totalDuration || 0} Hours</span>
                      </div>
                      <div className="text-right">
                        <span>
                          Paid: <strong className="text-foreground">${enroll.pricePaid}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                        <span>Learning Progress</span>
                        <span className="font-bold text-foreground">
                          {Math.round(enroll.completedPercent)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] rounded-full transition-all duration-500"
                          style={{ width: `${enroll.completedPercent}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      to={`/student/courses/${enroll.course?.slug}`}
                      className="group/btn mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_var(--accent-cyan)]"
                    >
                      <span>Resume Learning</span>
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                    </Link>
                  </div>
                </MagicBentoCard>
              ))}
            </MagicBentoSection>
          )}
        </div>
      </div>
    </main>
  );
}
