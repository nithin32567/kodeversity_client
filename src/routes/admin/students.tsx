import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Users, AlertCircle, Phone, GraduationCap, Calendar, BookOpen } from "lucide-react";
import { managementService } from "@/infrastructure/admin/managementService";
import type { User } from "@/domain/user";

export interface Student extends User {
  phone?: string;
  highestQualification?: string;
  createdAt?: string;
  updatedAt?: string;
  enrolledCourses?: unknown[];
  chapterProgress?: unknown[];
}

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Student Management — Kodeversity" }] }),
  component: AdminStudentsPage,
});

export function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStudents = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    managementService
      .getStudents()
      .then((studentList) => {
        setStudents(studentList as Student[]);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load students:", err);
        setIsError(true);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      return (
        (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (s.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      );
    });
  }, [students, searchQuery]);

  return (
    <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-display">
            Student Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all registered students.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--hairline)]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-2)]/30 animate-pulse"
            >
              <div className="h-12 w-12 rounded-full bg-white/[0.04]" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-white/[0.04] rounded w-1/2" />
                <div className="h-3 bg-white/[0.04] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-3 animate-pulse" />
          <h3 className="font-semibold text-lg">Unable to load students</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            There was an error connecting to the authentication service.
          </p>
          <button
            onClick={fetchStudents}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--hairline)] text-sm text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
          <Users className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="font-semibold text-lg text-foreground/80">No students match your query</h3>
          <p className="text-sm text-muted-foreground mt-1">Try resetting your search term.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="flex flex-col p-5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  {student.avatarUrl ? (
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="h-12 w-12 rounded-full object-cover border border-[var(--hairline)]"
                    />
                  ) : (
                    <div
                      className="h-12 w-12 rounded-full grid place-items-center text-white text-sm font-semibold border border-[var(--hairline)]"
                      style={{ background: "var(--grad-purple)" }}
                    >
                      {(student.name || "UN").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-[var(--surface)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate text-foreground">
                    {student.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                  <div className="mt-1 text-[10px] uppercase font-bold tracking-wider text-blue-400">
                    {student.role || "STUDENT"}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t border-[var(--hairline)]">
                {student.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{student.phone}</span>
                  </div>
                )}
                {student.highestQualification && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{student.highestQualification}</span>
                  </div>
                )}
                {student.createdAt && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Enrolled Courses: {student.enrolledCourses?.length || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
