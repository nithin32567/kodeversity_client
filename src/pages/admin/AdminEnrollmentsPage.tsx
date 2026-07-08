import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Users,
  BookOpen,
  Check,
  CreditCard,
  UserCheck,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { managementService } from "@/infrastructure/admin/managementService";
import type { Course } from "@/domain/course";
import type { User } from "@/domain/user";
import { useAdminEnrollStudent } from "@/presentation/features/admin-enrollments/hooks/useAdminEnrollment";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";

export function AdminEnrollmentsPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [studentSearch, setStudentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Mutation hook
  const enrollMutation = useAdminEnrollStudent();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [fetchedStudents, fetchedCourses] = await Promise.all([
        managementService.getStudents(),
        managementService.getCourses(),
      ]);
      setStudents(fetchedStudents.filter((s) => s.status !== "SUSPENDED"));
      setCourses(fetchedCourses);
    } catch (err) {
      console.error("Failed to load enrollment resources:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchData();
    }
  }, [isAuthLoading, isAuthenticated, fetchData]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const query = studentSearch.toLowerCase();
      return (
        (s.name || "").toLowerCase().includes(query) ||
        (s.email || "").toLowerCase().includes(query)
      );
    });
  }, [students, studentSearch]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const query = courseSearch.toLowerCase();
      return (
        (c.title || "").toLowerCase().includes(query) ||
        (c.level || "").toLowerCase().includes(query)
      );
    });
  }, [courses, courseSearch]);

  // Submit enrollment
  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) return;

    await enrollMutation.mutate({
      studentId: selectedStudent.id,
      courseId: selectedCourse.id,
    });
    setSelectedStudent(null);
    setSelectedCourse(null);
  };

  if (isAuthLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="text-sm text-muted-foreground font-mono uppercase">
            Verifying credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8 space-y-6 overflow-y-auto max-w-[1450px] mx-auto w-full">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-[var(--hairline)] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-display flex items-center gap-3">
            <UserCheck className="h-7 w-7 text-indigo-400" />
            Manual course Enrollment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enroll students into courses directly, bypassing payment gates. Price paid is recorded
            as 0.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/60 text-xs font-semibold text-muted-foreground hover:text-foreground transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 animate-pulse h-[400px]" />
          <div className="lg:col-span-6 p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 animate-pulse h-[400px]" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center max-w-xl mx-auto">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-3 animate-pulse" />
          <h3 className="font-semibold text-lg">Failed to load active users and courses</h3>
          <p className="text-sm text-muted-foreground mt-2">
            There was a connection issue with the database service cluster.
          </p>
          <button
            onClick={fetchData}
            className="mt-5 px-5 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-sm text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {}
          <div className="lg:col-span-6 p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--hairline)]">
              <div>
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-blue-400" />
                  1. Select a Student
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Search and pick the student to enroll.
                </p>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-mono bg-white/[0.04] text-muted-foreground rounded-full border border-[var(--hairline)]">
                Active: {students.length}
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Filter by name or email..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="border border-[var(--hairline)] rounded-lg bg-[var(--surface-2)]/30 max-h-[350px] overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No students match your search.
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = selectedStudent?.id === student.id;
                  return (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition select-none ${
                        isSelected
                          ? "bg-blue-500/10 border border-blue-500/30 text-blue-300"
                          : "hover:bg-[var(--surface-2)] border border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="relative shrink-0">
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt={student.name || ""}
                            className="h-8 w-8 rounded-full object-cover border border-[var(--hairline)]"
                          />
                        ) : (
                          <div
                            className="h-8 w-8 rounded-full grid place-items-center text-white text-[10px] font-semibold border border-[var(--hairline)]"
                            style={{ background: "var(--grad-purple)" }}
                          >
                            {(student.name || "ST").slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        {isSelected && (
                          <span className="absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full bg-blue-500 border-2 border-[var(--surface)] flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate text-foreground">
                          {student.name || "Unnamed Student"}
                        </div>
                        <div className="text-[10px] opacity-70 truncate">{student.email}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {}
          <div className="lg:col-span-6 p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--hairline)]">
              <div>
                <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                  <BookOpen className="h-4.5 w-4.5 text-purple-400" />
                  2. Select a Course
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose the destination course catalog entry.
                </p>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-mono bg-white/[0.04] text-muted-foreground rounded-full border border-[var(--hairline)]">
                Total: {courses.length}
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Filter by course title..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)] text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="border border-[var(--hairline)] rounded-lg bg-[var(--surface-2)]/30 max-h-[350px] overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
              {filteredCourses.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No courses match your search.
                </div>
              ) : (
                filteredCourses.map((course) => {
                  const isSelected = selectedCourse?.id === course.id;
                  return (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition select-none ${
                        isSelected
                          ? "bg-purple-500/10 border border-purple-500/30 text-purple-300"
                          : "hover:bg-[var(--surface-2)] border border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="relative shrink-0">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="h-8 w-12 rounded object-cover border border-[var(--hairline)]"
                          />
                        ) : (
                          <div
                            className="h-8 w-12 rounded grid place-items-center text-white text-[9px] font-semibold border border-[var(--hairline)]"
                            style={{ background: "var(--grad-blue)" }}
                          >
                            C
                          </div>
                        )}
                        {isSelected && (
                          <span className="absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full bg-purple-500 border-2 border-[var(--surface)] flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate text-foreground">
                          {course.title}
                        </div>
                        <div className="text-[9px] opacity-75 font-mono uppercase tracking-wide">
                          {course.level.replace(/_/g, " ")}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {}
          <div className="lg:col-span-12 p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold tracking-tight text-foreground font-display flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  Enrollment Configuration
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verify selection details. Both student and course must be selected to authorize.
                </p>

                {}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Student:</span>
                    {selectedStudent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {selectedStudent.name || selectedStudent.email}
                      </span>
                    ) : (
                      <span className="text-xs text-rose-400 font-medium italic">Not selected</span>
                    )}
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground/45 hidden md:block" />

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Course:</span>
                    {selectedCourse ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {selectedCourse.title}
                      </span>
                    ) : (
                      <span className="text-xs text-rose-400 font-medium italic">Not selected</span>
                    )}
                  </div>
                </div>
              </div>

              {}
              <div className="flex flex-col items-stretch md:items-end gap-2.5 shrink-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center md:justify-end">
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  <span>Recorded as: </span>
                  <span className="font-bold text-foreground bg-white/[0.04] px-1.5 py-0.5 rounded border border-[var(--hairline)]">
                    $0.00 (Bypassed)
                  </span>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={!selectedStudent || !selectedCourse || enrollMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-[image:var(--grad-cta)] shadow-lg shadow-indigo-500/20 hover:opacity-95 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {enrollMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Creating Enrollment...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Enroll Student Free
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
