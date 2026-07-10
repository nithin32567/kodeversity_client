/**
 * useAdminEnrollStudent — RTK Query migration
 * Replaces: useMutation + useQueryClient from @tanstack/react-query
 * Uses: useEnrollStudentMutation from features/admin/adminApi
 */
import { toast } from "sonner";
import { useEnrollStudentMutation } from "@/features/admin/adminApi";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAppDispatch } from "@/app/hooks";
import { baseApi } from "@/services/api";

export function useAdminEnrollStudent() {
  const [enrollStudent, { isLoading }] = useEnrollStudentMutation();
  const dispatch = useAppDispatch();

  const mutate = async (payload: { studentId: string; courseId: string }) => {
    try {
      // Use existing managementService for the detailed response (name/title)
      const data = await managementService.enrollStudent(payload);
      toast.success(
        `Successfully enrolled student "${data.student.name || data.student.email}" in "${data.course.title}"`,
      );
      // Invalidate RTK Query cache tags
      dispatch(baseApi.util.invalidateTags(["Courses", "Analytics"]));
      return data;
    } catch (error) {
      const err = error as Error & { message?: string };
      console.error("Enrollment error:", err);
      toast.error(err.message || "Failed to enroll student.");
      throw error;
    }
  };

  return { mutate, isPending: isLoading };
}
