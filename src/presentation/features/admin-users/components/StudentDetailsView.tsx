import {
  BookOpen,
  Calendar,
  GraduationCap,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Target,
  Award,
} from "lucide-react";
import type { Course } from "@/domain/course";
import type { StudentEnrollment } from "@/infrastructure/student/studentService";
import type { Student } from "./StudentCard";

export interface StudentDetailsViewProps {
  user: Student;
  courses: Course[];
  enrollments: StudentEnrollment[];
}

export function StudentDetailsView({ user, courses, enrollments }: StudentDetailsViewProps) {
  const enrolledCoursesList = enrollments
    .map((e) => {
      const course = courses.find((c) => c.id === e.courseId);
      return { ...e, course };
    })
    .filter((e) => e.course);

  const completedCount = enrolledCoursesList.filter((e) => e.isCompleted).length;
  const avgProgress =
    enrolledCoursesList.length > 0
      ? Math.round(
          enrolledCoursesList.reduce((acc, curr) => acc + (curr.completedPercent || 0), 0) /
            enrolledCoursesList.length,
        )
      : 0;

  const paymentPendingList = enrolledCoursesList.filter((e) => {
    const price = e.course?.price || 0;
    return price > (e.pricePaid || 0);
  });
  const hasPaymentPending = paymentPendingList.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Section: Profile & Stats */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Profile Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-lg relative overflow-hidden">
          <div
            className="absolute -right-20 -top-20 h-48 w-48 rounded-full blur-[80px] opacity-20 pointer-events-none"
            style={{ background: "var(--grad-purple)" }}
          />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "User"}
                  className={`h-24 w-24 rounded-full object-cover border-4 border-[var(--surface-2)] shadow-xl ${
                    user.status === "SUSPENDED" ? "grayscale opacity-80" : ""
                  }`}
                />
              ) : (
                <div
                  className="h-24 w-24 rounded-full grid place-items-center text-3xl font-bold text-white shadow-xl border-4 border-[var(--surface-2)]"
                  style={{ background: "var(--grad-purple)" }}
                >
                  {(user.name || "UN").slice(0, 2).toUpperCase()}
                </div>
              )}
              {user.status === "SUSPENDED" ? (
                <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-rose-500 border-2 border-[var(--surface)]" />
              ) : (
                <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[var(--surface)]" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {user.role}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    user.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {user.status || "ACTIVE"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--hairline)] space-y-3 relative z-10">
            {user.phone && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-[var(--surface-2)]/40 p-2 rounded-lg border border-[var(--hairline)]/50">
                <Phone className="h-4 w-4 text-indigo-400" />
                <span className="font-medium text-foreground">{user.phone}</span>
              </div>
            )}
            {user.highestQualification && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-[var(--surface-2)]/40 p-2 rounded-lg border border-[var(--hairline)]/50">
                <GraduationCap className="h-4 w-4 text-purple-400" />
                <span className="font-medium text-foreground">{user.highestQualification}</span>
              </div>
            )}
            {user.createdAt && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-[var(--surface-2)]/40 p-2 rounded-lg border border-[var(--hairline)]/50">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-foreground">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
          <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] flex flex-col justify-between hover:bg-[var(--surface-2)] transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <BookOpen className="h-5 w-5 text-indigo-400" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Total Enrolled</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">{enrolledCoursesList.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Courses assigned to student</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] flex flex-col justify-between hover:bg-[var(--surface-2)] transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Award className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Completed</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">{completedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Courses finished successfully</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] flex flex-col justify-between hover:bg-[var(--surface-2)] transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Avg. Completion</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">{avgProgress}%</div>
              <div className="w-full h-1.5 bg-[var(--surface-2)] rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                  style={{ width: `${avgProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-2xl border flex flex-col justify-between transition ${
              hasPaymentPending
                ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
                : "border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`p-2 rounded-xl border ${
                  hasPaymentPending
                    ? "bg-amber-500/10 border-amber-500/20"
                    : "bg-emerald-500/10 border-emerald-500/20"
                }`}
              >
                <CreditCard
                  className={`h-5 w-5 ${hasPaymentPending ? "text-amber-400" : "text-emerald-400"}`}
                />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Payment Status</span>
            </div>
            <div>
              <div
                className={`text-2xl font-bold ${
                  hasPaymentPending ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {hasPaymentPending ? `${paymentPendingList.length} Pending` : "All Cleared"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {hasPaymentPending
                  ? "Action required for outstanding dues"
                  : "No outstanding payments"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Detailed List */}
      <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-lg">
        <div className="p-6 border-b border-[var(--hairline)] bg-[var(--surface-2)]/30 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Enrolled Courses Journey</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Detailed tracking of the student's progress in curriculum.
            </p>
          </div>
          <BookOpen className="h-8 w-8 text-indigo-400/20" />
        </div>
        <div className="p-6">
          {enrolledCoursesList.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[var(--hairline)] rounded-xl bg-[var(--surface-2)]/30 flex flex-col items-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-foreground/80">No active enrollments</p>
              <p className="text-xs text-muted-foreground mt-1">This user hasn't enrolled yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCoursesList.map((enrollment) => {
                const isPaid = (enrollment.pricePaid || 0) >= (enrollment.course?.price || 0);

                return (
                  <div
                    key={enrollment.id}
                    className="group relative flex flex-col p-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)] transition-all overflow-hidden"
                  >
                    <div className="relative w-full h-32 rounded-lg overflow-hidden mb-4 border border-[var(--hairline)] bg-black/40">
                      {enrollment.course?.thumbnailUrl ? (
                        <img
                          src={enrollment.course.thumbnailUrl}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-purple-400/50">
                          <BookOpen className="h-8 w-8 mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            No Cover
                          </span>
                        </div>
                      )}
                      {enrollment.isCompleted && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-md flex items-center gap-1 uppercase">
                          <CheckCircle2 className="h-3 w-3" />
                          Done
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <h4 className="font-bold text-sm text-white line-clamp-2 leading-tight mb-2 group-hover:text-purple-400 transition-colors">
                        {enrollment.course?.title}
                      </h4>

                      <div className="mt-auto space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground font-medium">Progress</span>
                            <span className="text-indigo-400 font-bold">
                              {enrollment.completedPercent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${
                                enrollment.isCompleted
                                  ? "bg-emerald-400"
                                  : "bg-gradient-to-r from-purple-500 to-indigo-500"
                              }`}
                              style={{ width: `${enrollment.completedPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--hairline)] pt-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{new Date(enrollment.purchasedAt).toLocaleDateString()}</span>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                              isPaid
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {isPaid ? "Paid" : "Pending"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
