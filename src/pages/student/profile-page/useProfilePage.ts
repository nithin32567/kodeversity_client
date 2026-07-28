import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { studentService, type StudentEnrollment } from "@/infrastructure/student/studentService";
import { managementService } from "@/infrastructure/admin/managementService";
import type { Course } from "@/domain/course";

export function useProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [profileDetail, setProfileDetail] = useState<{
    phone?: string | null;
    highestQualification?: string | null;
    createdAt?: string;
  } | null>(null);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const loadProfileData = useCallback(async () => {
    if (isAuthLoading || !user) return;
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
  }, [isAuthLoading, user]);

  useEffect(() => {
    void loadProfileData();
  }, [loadProfileData]);

  const purchasedCourses = enrollments
    .map((enroll) => {
      const course = courses.find((c) => c.id === enroll.courseId);
      return {
        ...enroll,
        course,
      };
    })
    .filter((e) => e.course !== undefined);

  return {
    user,
    isAuthLoading,
    profileDetail,
    loading,
    editModalOpen,
    setEditModalOpen,
    purchasedCourses,
    loadProfileData,
  };
}
