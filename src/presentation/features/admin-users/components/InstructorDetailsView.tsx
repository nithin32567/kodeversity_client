import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Phone,
  Users,
  Award,
  Eye,
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
import type { Student } from "./StudentCard";
import { managementService, type EnrolledStudentItem } from "@/infrastructure/admin/managementService";

export interface InstructorDetailsViewProps {
  user: Student; // Using the Student interface as a base User profile
  courses: Course[];
}

export function InstructorDetailsView({ user, courses }: InstructorDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "STUDENTS">("OVERVIEW");
  const [courseStudents, setCourseStudents] = useState<Record<string, EnrolledStudentItem[]>>({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const assignedCourses = useMemo(() => courses.filter((c) => c.instructorId === user.id), [courses, user.id]);

  useEffect(() => {
    async function fetchStudents() {
      if (assignedCourses.length === 0) return;
      setIsLoadingStudents(true);
      const results: Record<string, EnrolledStudentItem[]> = {};
      try {
        await Promise.all(
          assignedCourses.map(async (course) => {
            const students = await managementService.getEnrolledStudents(course.id);
            results[course.id] = students;
          })
        );
        setCourseStudents(results);
      } catch (err) {
        console.error("Failed to load students", err);
      } finally {
        setIsLoadingStudents(false);
      }
    }
    fetchStudents();
  }, [assignedCourses]);

  const totalStudents = assignedCourses.reduce((acc, curr) => acc + (courseStudents[curr.id]?.length || curr.enrollmentCount || 0), 0);

  const chartData = assignedCourses.map((c) => ({
    name: c.title && c.title.length > 15 
      ? c.title.substring(0, 15) + "..." 
      : c.title || "Unknown",
    students: courseStudents[c.id]?.length || c.enrollmentCount || 0,
  }));

  const allStudentsList = useMemo(() => {
    const list: Array<{ student: any, courseName: string, purchasedAt: string, enrollmentId: string, studentId: string }> = [];
    assignedCourses.forEach(course => {
      const students = courseStudents[course.id] || [];
      students.forEach(s => {
        if (s.student) {
          list.push({
            student: s.student,
            studentId: s.studentId || s.student.id,
            courseName: course.title,
            purchasedAt: s.purchasedAt,
            enrollmentId: s.id,
          });
        }
      });
    });
    return list;
  }, [assignedCourses, courseStudents]);

  return (
    <div className="grid gap-4 lg:grid-cols-12 items-start h-full pb-8">
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
                  className={`h-20 w-20 rounded-full object-cover border-2 border-[var(--surface-2)] shadow-sm ${
                    user.status === "SUSPENDED" ? "grayscale opacity-80" : ""
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
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
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
            <div className="p-2 rounded-md bg-purple-500/10 border border-purple-500/20">
              <BookOpen className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">Assigned Courses</span>
              <div className="text-lg font-bold text-white font-mono leading-none">{assignedCourses.length}</div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] flex items-center gap-3 hover:bg-[var(--surface-2)] transition shadow-sm">
            <div className="p-2 rounded-md bg-indigo-500/10 border border-indigo-500/20">
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">Total Students</span>
              <div className="text-lg font-bold text-white font-mono leading-none">{totalStudents}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Main Content: Tabs, Chart & Courses */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-4 flex flex-col min-w-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[var(--hairline)]">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "OVERVIEW"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("STUDENTS")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "STUDENTS"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Enrolled Students
          </button>
        </div>

        {activeTab === "OVERVIEW" ? (
          <>
            {/* Chart Section */}
            {assignedCourses.length > 0 && (
              <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-sm p-4 shrink-0">
                <h3 className="text-sm font-bold text-white font-display mb-4">Students per Course</h3>
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
                      />
                      <RechartsTooltip 
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        contentStyle={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--hairline)', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [value, 'Students']}
                      />
                      <Bar dataKey="students" fill="url(#colorStudents)" radius={[4, 4, 0, 0]} />
                      <defs>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Assigned Courses Detailed List */}
            <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-sm flex-1 flex flex-col">
              <div className="p-4 border-b border-[var(--hairline)] bg-[var(--surface-2)]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-display">Teaching Portfolio</h3>
                  <span className="bg-purple-500/20 text-purple-400 py-0.5 px-2 rounded-full text-[10px] font-bold">
                    {assignedCourses.length}
                  </span>
                </div>
                <Award className="h-5 w-5 text-purple-400/30" />
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {assignedCourses.length === 0 ? (
                  <div className="p-8 h-full flex flex-col justify-center items-center text-center border border-dashed border-[var(--hairline)] rounded-lg bg-[var(--surface-2)]/30">
                    <BookOpen className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-medium text-foreground/80">No courses assigned</p>
                  </div>
                ) : (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {assignedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="group relative flex flex-col p-3 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)] transition-all overflow-hidden"
                      >
                        <div className="relative w-full h-24 rounded-md overflow-hidden mb-3 border border-[var(--hairline)] bg-black/40">
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-purple-400/50">
                              <BookOpen className="h-6 w-6 mb-1" />
                              <span className="text-[9px] font-bold uppercase tracking-wider">No Cover</span>
                            </div>
                          )}
                          <div className="absolute top-1.5 right-1.5 bg-[var(--surface)]/80 backdrop-blur border border-[var(--hairline)] text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm">
                            {course.level}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                          <h4 className="font-semibold text-xs text-white line-clamp-2 leading-tight mb-3 group-hover:text-purple-400 transition-colors">
                            {course.title}
                          </h4>

                          <div className="mt-auto flex items-center justify-between border-t border-[var(--hairline)] pt-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{courseStudents[course.id]?.length || course.enrollmentCount || 0} Students</span>
                            </div>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              ${course.price || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-sm flex-1 flex flex-col">
            <div className="p-4 border-b border-[var(--hairline)] bg-[var(--surface-2)]/30 flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-display">Enrolled Students</h3>
              <div className="bg-purple-500/20 text-purple-400 py-0.5 px-2 rounded-full text-[10px] font-bold">
                {allStudentsList.length} Total
              </div>
            </div>
            <div className="p-0 flex-1 overflow-y-auto min-h-[300px]">
              {isLoadingStudents ? (
                <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : allStudentsList.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center text-muted-foreground border border-dashed border-[var(--hairline)] m-4 rounded-lg bg-[var(--surface-2)]/30">
                  <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <span className="text-sm font-medium">No students currently enrolled</span>
                </div>
              ) : (
                <div className="divide-y divide-[var(--hairline)]">
                  {allStudentsList.map((item) => (
                    <div key={item.enrollmentId} className="flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-500/20 shadow-sm">
                          {(item.student.name || "UN").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">{item.student.name || "Unknown Student"}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {item.courseName}
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/admin/users/${item.studentId}`}
                        className="h-8 w-8 rounded-md grid place-items-center border border-[var(--hairline)] text-muted-foreground hover:text-blue-400 hover:bg-[var(--surface-2)] transition shadow-sm cursor-pointer"
                        title="View Student Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
