import {
  BookOpen,
  Calendar,
  GraduationCap,
  Phone,
  Users,
  Award,
} from "lucide-react";
import type { Course } from "@/domain/course";
import type { Student } from "./StudentCard";

export interface InstructorDetailsViewProps {
  user: Student; // Using the Student interface as a base User profile
  courses: Course[];
}

export function InstructorDetailsView({ user, courses }: InstructorDetailsViewProps) {
  const assignedCourses = courses.filter((c) => c.instructorId === user.id);
  const totalStudents = assignedCourses.reduce((acc, curr) => acc + (curr.enrollmentCount || 0), 0);

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
          <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] flex flex-col justify-between hover:bg-[var(--surface-2)] transition shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <BookOpen className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Assigned Courses</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">{assignedCourses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Courses currently managing</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] flex flex-col justify-between hover:bg-[var(--surface-2)] transition shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Total Students</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-mono">{totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all assigned courses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Courses List */}
      <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-lg">
        <div className="p-6 border-b border-[var(--hairline)] bg-[var(--surface-2)]/30 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Teaching Portfolio</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Courses assigned to this instructor.
            </p>
          </div>
          <Award className="h-8 w-8 text-purple-400/20" />
        </div>
        <div className="p-6">
          {assignedCourses.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[var(--hairline)] rounded-xl bg-[var(--surface-2)]/30 flex flex-col items-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-foreground/80">No courses assigned</p>
              <p className="text-xs text-muted-foreground mt-1">This instructor is not managing any courses.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignedCourses.map((course) => (
                <div
                  key={course.id}
                  className="group relative flex flex-col p-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)] transition-all overflow-hidden"
                >
                  <div className="relative w-full h-32 rounded-lg overflow-hidden mb-4 border border-[var(--hairline)] bg-black/40">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-purple-400/50">
                        <BookOpen className="h-8 w-8 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">No Cover</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-[var(--surface)]/80 backdrop-blur border border-[var(--hairline)] text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-md">
                      {course.level}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-sm text-white line-clamp-2 leading-tight mb-2 group-hover:text-purple-400 transition-colors">
                      {course.title}
                    </h4>

                    <div className="mt-auto flex items-center justify-between border-t border-[var(--hairline)] pt-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>{course.enrollmentCount || 0} Students</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
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
    </div>
  );
}
