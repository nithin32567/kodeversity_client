import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { studentService, type StudentEnrollment } from "@/infrastructure/student/studentService";
import { managementService } from "@/infrastructure/admin/managementService";
import type { Course } from "@/domain/course";

export const Route = createFileRoute("/_auth/student/profile")({
  head: () => ({ meta: [{ title: "My Profile — Kodeversity" }] }),
  component: StudentProfilePage,
});

export function StudentProfilePage() {
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
          // If no student profile is synced yet, fetch enrollments directly
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
          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your profile information...</p>
        </div>
      </div>
    );
  }

  // Map courses with student enrollments
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
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
      {/* ── TOP SECTION: PROFILE CARD ── */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card relative overflow-hidden shadow-xl">
        <div
          className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full blur-[90px] opacity-10"
          style={{ background: "var(--gradient-primary)" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Avatar Initials */}
          <div
            className="h-20 w-20 sm:h-24 sm:w-24 rounded-full grid place-items-center text-white text-3xl font-bold border-2 border-border shadow-lg"
            style={{ background: "var(--gradient-primary)" }}
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

          {/* User Details */}
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2">
                {user?.name || "Student Name"}
              </h2>
              <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                Role: {user?.role || "STUDENT"}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 max-w-3xl pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-4 w-4 text-blue-400/80 shrink-0" />
                <span className="truncate text-foreground/90">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-4 w-4 text-purple-400/80 shrink-0" />
                <span className="truncate text-foreground/90">
                  {profileDetail?.phone || "+91 XXXXX XXXXX"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <GraduationCap className="h-4 w-4 text-emerald-400/80 shrink-0" />
                <span className="truncate text-foreground/90">
                  {profileDetail?.highestQualification || "Not Specified"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-4 w-4 text-amber-400/80 shrink-0" />
                <span className="truncate text-foreground/90">
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
      </div>

      {/* ── BOTTOM SECTION: PURCHASED COURSES ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight font-display flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            Purchased Courses ({purchasedCourses.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your enrolled bootcamps, courses, and progress.
          </p>
        </div>

        {purchasedCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-border bg-card/10 text-center">
            <Award className="h-12 w-12 text-muted-foreground/45 mb-3" />
            <h3 className="font-semibold text-lg text-foreground/80">No active purchases found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              It seems you haven't bought or registered in any courses yet.
            </p>
            <Link
              to="/courses"
              className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition"
            >
              Browse Course Catalog
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {purchasedCourses.map((enroll) => (
              <div
                key={enroll.id}
                className="flex flex-col p-5 rounded-2xl border border-border bg-card hover:bg-card/85 transition duration-300 group shadow-lg"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-xl bg-card border border-border overflow-hidden shrink-0">
                  {enroll.course?.thumbnailUrl ? (
                    <img
                      src={enroll.course.thumbnailUrl}
                      alt={enroll.course.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-indigo-400/50" />
                    </div>
                  )}
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 text-[9px] font-semibold tracking-wider bg-black/60 backdrop-blur-sm text-white rounded uppercase border border-white/10">
                    {enroll.course?.level || "Beginner"}
                  </span>
                </div>

                {/* Info */}
                <div className="mt-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-[15px] leading-tight text-white line-clamp-1 group-hover:text-indigo-400 transition">
                      {enroll.course?.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {enroll.course?.subtitle || "Self-paced expert curriculum program."}
                    </p>
                  </div>

                  {/* Pricing and Stats */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-400/80" />
                      <span>{enroll.course?.totalDuration || 0} Hours</span>
                    </div>
                    <div className="text-right">
                      <span>
                        Paid: <strong>${enroll.pricePaid}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                      <span>Learning Progress</span>
                      <span className="font-semibold text-foreground">
                        {Math.round(enroll.completedPercent)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${enroll.completedPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Resume Learning Button */}
                  <button
                    onClick={() => {
                      alert(
                        `Resume Course learning for: "${enroll.course?.title}".\nIn production, this navigates to the learning viewer/player.`,
                      );
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:scale-[0.98] transition cursor-pointer"
                  >
                    <span>Resume Learning</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
