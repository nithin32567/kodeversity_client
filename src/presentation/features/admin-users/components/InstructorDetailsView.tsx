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
    <div className="space-y-4">
      {/* Top Section: Profile & Stats */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Profile Card */}
        <div className="lg:col-span-4 xl:col-span-3 p-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface)] shadow-sm relative overflow-hidden flex flex-col">
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

        {/* Quick Stats */}
        <div className="lg:col-span-8 xl:col-span-9 grid gap-3 grid-cols-2 items-start content-start">
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

      {/* Assigned Courses List */}
      <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--hairline)] bg-[var(--surface-2)]/30 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display">Teaching Portfolio</h3>
          </div>
          <Award className="h-5 w-5 text-purple-400/30" />
        </div>
        <div className="p-4">
          {assignedCourses.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[var(--hairline)] rounded-lg bg-[var(--surface-2)]/30 flex flex-col items-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-foreground/80">No courses assigned</p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                        <span>{course.enrollmentCount || 0} Students</span>
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
    </div>
  );
}
