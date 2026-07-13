import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  BookOpen,
  User as UserIcon,
  Calendar,
  GraduationCap,
  Phone,
} from "lucide-react";
import { managementService } from "@/infrastructure/admin/managementService";
import { studentService, type StudentEnrollment } from "@/infrastructure/student/studentService";
import type { User } from "@/domain/user";
import type { Course } from "@/domain/course";
import { Student } from "@/presentation/features/admin-users/components/StudentCard";
import { StudentDetailsView } from "@/presentation/features/admin-users/components/StudentDetailsView";
import { InstructorDetailsView } from "@/presentation/features/admin-users/components/InstructorDetailsView";

export function AdminUserDetailsPage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [students, suspendedUsers, instructors, allCourses, studentEnrollments] =
        await Promise.all([
          managementService.getStudents(),
          managementService.getSuspendedUsers(),
          managementService.getInstructors(),
          managementService.getCourses(),
          studentService.getStudentEnrollments(userId),
        ]);

      const studentsWithRole = students.map((s) => ({ ...s, role: s.role || "STUDENT" }));
      const instructorsWithRole = instructors.map((i) => ({ ...i, role: i.role || "INSTRUCTOR" }));
      const suspendedWithRole = suspendedUsers.map((s) => ({ ...s, role: s.role || "STUDENT" }));

      const allUsers = [...studentsWithRole, ...suspendedWithRole, ...instructorsWithRole];
      const foundUser = allUsers.find((u) => u.id === userId) as Student;
      setUser(foundUser || null);
      setCourses(allCourses);
      setEnrollments(studentEnrollments);
    } catch (err) {
      console.error("Failed to load user details", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (isLoading) {
    return (
      <main className="flex-1 p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <UserIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-bold">User Not Found</h2>
        <Link to="/admin/users" className="text-purple-400 hover:underline mt-4">
          Return to Users
        </Link>
      </main>
    );
  }

  const assignedCourses = courses.filter((c) => c.instructorId === user.id);
  const enrolledCoursesList = enrollments
    .map((e) => {
      const course = courses.find((c) => c.id === e.courseId);
      return { ...e, course };
    })
    .filter((e) => e.course); // Only show if course exists

  return (
    <main className="flex-1 p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto w-full overflow-y-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/users"
          className="p-2 rounded-lg border border-[var(--hairline)] hover:bg-[var(--surface-2)] transition bg-[var(--surface)] shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl font-display leading-none">
            {user.name ? `${user.name}'s Details` : "User Details"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            View information, enrollments, and assigned courses.
          </p>
        </div>
      </div>

      {user.role?.toUpperCase() === "STUDENT" || user.role?.toUpperCase() === "ADMIN" ? (
        <StudentDetailsView user={user} courses={courses} enrollments={enrollments} />
      ) : null}

      {user.role?.toUpperCase() === "INSTRUCTOR" || user.role?.toUpperCase() === "ADMIN" ? (
        <InstructorDetailsView user={user} courses={courses} />
      ) : null}
    </main>
  );
}
