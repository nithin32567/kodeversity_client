import { useState } from "react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import type { Course } from "@/domain/course";
import type { StudentEnrollment } from "@/infrastructure/student/studentService";
import type { Student } from "./StudentCard";

export interface StudentDetailsViewProps {
  user: Student;
  courses: Course[];
  enrollments: StudentEnrollment[];
}

type FilterType = "ALL" | "COMPLETED" | "PENDING";

export function StudentDetailsView({ user, courses, enrollments }: StudentDetailsViewProps) {
  const [filter, setFilter] = useState<FilterType>("ALL");

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

  const filteredCourses = enrolledCoursesList.filter((e) => {
    if (filter === "COMPLETED") return e.isCompleted;
    if (filter === "PENDING") return (e.course?.price || 0) > (e.pricePaid || 0);
    return true;
  });

  const chartData = enrolledCoursesList.map((e) => ({
    name: e.course?.title && e.course.title.length > 15 
      ? e.course.title.substring(0, 15) + "..." 
      : e.course?.title || "Unknown",
    progress: e.completedPercent || 0,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-12 items-start h-full">
      {/* Left Sidebar: Profile & Stats */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-4 flex flex-col">
        {/* Profile Card */}
        <div className="p-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface)] shadow-sm relative overflow-hidden flex flex-col">
          <div
            className="absolute -right-20 -top-20 h-40 w-40 rounded-full blur-[60px] opacity-20 pointer-events-none"
            style={{ background: "var(--grad-purple)" }}
          />
          <div className="relative z-10 flex flex-col items-center text-center space-y-3">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "User"}
                  className={`h-20 w-20 rounded-full object-cover border-2 border-[var(--surface-2)] shadow-sm ${user.status === "SUSPENDED" ? "grayscale opacity-80" : ""
                    }`}
                />
              ) : (
                <div
                  className="h-20 w-20 rounded-full grid place-items-center text-2xl font-bold text-white shadow-sm border-2 border-[var(--surface-2)]"
                  style={{ background: "var(--grad-purple)" }}
                >
                  {(user.name || "UN").slice(0, 2).toUpperCase()}
                </div>
              )}
              {user.status === "SUSPENDED" ? (
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-rose-500 border-2 border-[var(--surface)]" />
              ) : (
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[var(--surface)]" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">{user.name}</h2>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {user.role}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${user.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                >
                  {user.status || "ACTIVE"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--hairline)] space-y-2 relative z-10 flex-1 flex flex-col justify-end">
            {user.phone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[var(--surface-2)]/30 p-1.5 rounded-md border border-[var(--hairline)]/30">
                <Phone className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-medium text-foreground truncate">{user.phone}</span>
              </div>
            )}
            {user.highestQualification && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[var(--surface-2)]/30 p-1.5 rounded-md border border-[var(--hairline)]/30">
                <GraduationCap className="h-3.5 w-3.5 text-purple-400" />
                <span className="font-medium text-foreground truncate">{user.highestQualification}</span>
              </div>
            )}
            {user.createdAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[var(--surface-2)]/30 p-1.5 rounded-md border border-[var(--hairline)]/30">
                <Calendar className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-medium text-foreground truncate">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Vertically Stacked */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
          <div className="p-3 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] flex items-center gap-3 hover:bg-[var(--surface-2)] transition shadow-sm">
            <div className="p-2 rounded-md bg-indigo-500/10 border border-indigo-500/20">
              <BookOpen className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">Enrolled</span>
              <div className="text-lg font-bold text-white font-mono leading-none">{enrolledCoursesList.length}</div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] flex items-center gap-3 hover:bg-[var(--surface-2)] transition shadow-sm">
            <div className="p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <Award className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">Completed</span>
              <div className="text-lg font-bold text-white font-mono leading-none">{completedCount}</div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] flex flex-col justify-center hover:bg-[var(--surface-2)] transition shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                <Target className="h-3 w-3 text-purple-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Progress</span>
              <span className="ml-auto text-xs font-bold text-white font-mono leading-none">{avgProgress}%</span>
            </div>
            <div className="w-full h-1 bg-[var(--surface-2)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border flex items-center gap-3 transition shadow-sm ${hasPaymentPending
              ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
              : "border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
              }`}
          >
            <div
              className={`p-2 rounded-md border ${hasPaymentPending
                ? "bg-amber-500/10 border-amber-500/20"
                : "bg-emerald-500/10 border-emerald-500/20"
                }`}
            >
              <CreditCard
                className={`h-4 w-4 ${hasPaymentPending ? "text-amber-400" : "text-emerald-400"}`}
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">Payment</span>
              <div
                className={`text-sm font-bold leading-none ${hasPaymentPending ? "text-amber-400" : "text-emerald-400"
                  }`}
              >
                {hasPaymentPending ? `${paymentPendingList.length} Pending` : "Cleared"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Main Content: Chart & Courses */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-4 flex flex-col min-w-0">
        {/* Chart Section */}
        {enrolledCoursesList.length > 0 && (
          <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-sm p-4 shrink-0">
            <h3 className="text-sm font-bold text-white font-display mb-4">Course Progress Overview</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${value}%`, 'Progress']}
                  />
                  <Bar dataKey="progress" fill="url(#colorProgress)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Courses Detailed List */}
        <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-sm flex-1 flex flex-col">
          <div className="p-4 border-b border-[var(--hairline)] bg-[var(--surface-2)]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-display">Enrolled Courses</h3>
              <span className="bg-purple-500/20 text-purple-400 py-0.5 px-2 rounded-full text-[10px] font-bold">
                {filteredCourses.length}
              </span>
            </div>
            <div className="flex items-center gap-2 p-1 bg-black/20 rounded-lg border border-[var(--hairline)]">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${filter === "ALL" ? "bg-[var(--surface-2)] text-white shadow-sm" : "text-muted-foreground hover:text-white"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("COMPLETED")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${filter === "COMPLETED" ? "bg-[var(--surface-2)] text-emerald-400 shadow-sm" : "text-muted-foreground hover:text-emerald-400/80"}`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter("PENDING")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${filter === "PENDING" ? "bg-[var(--surface-2)] text-amber-400 shadow-sm" : "text-muted-foreground hover:text-amber-400/80"}`}
              >
                Pending Pay
              </button>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {filteredCourses.length === 0 ? (
              <div className="p-8 h-full flex flex-col justify-center items-center text-center border border-dashed border-[var(--hairline)] rounded-lg bg-[var(--surface-2)]/30">
                <AlertCircle className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium text-foreground/80">No courses match this filter</p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((enrollment) => {
                  const isPaid = (enrollment.pricePaid || 0) >= (enrollment.course?.price || 0);

                  return (
                    <div
                      key={enrollment.id}
                      className="group relative flex flex-col p-3 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)] transition-all overflow-hidden"
                    >
                      <div className="relative w-full h-24 rounded-md overflow-hidden mb-3 border border-[var(--hairline)] bg-black/40">
                        {enrollment.course?.thumbnailUrl ? (
                          <img
                            src={enrollment.course.thumbnailUrl}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-purple-400/50">
                            <BookOpen className="h-6 w-6 mb-1" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">
                              No Cover
                            </span>
                          </div>
                        )}
                        {enrollment.isCompleted && (
                          <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm flex items-center gap-1 uppercase">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Done
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col">
                        <h4 className="font-semibold text-xs text-white line-clamp-2 leading-tight mb-3 group-hover:text-purple-400 transition-colors">
                          {enrollment.course?.title}
                        </h4>

                        <div className="mt-auto space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground font-medium">Progress</span>
                              <span className="text-indigo-400 font-bold">
                                {enrollment.completedPercent}%
                              </span>
                            </div>
                            <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${enrollment.isCompleted
                                  ? "bg-emerald-400"
                                  : "bg-gradient-to-r from-purple-500 to-indigo-500"
                                  }`}
                                style={{ width: `${enrollment.completedPercent}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-[var(--hairline)] pt-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(enrollment.purchasedAt).toLocaleDateString()}</span>
                            </div>
                            <div
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${isPaid
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
    </div>
  );
}
