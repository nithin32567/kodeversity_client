import { useMutation, useQueryClient } from "@tanstack/react-query";
import { managementService } from "@/infrastructure/admin/managementService";
import { toast } from "sonner";

export function useAdminEnrollStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { studentId: string; courseId: string }) =>
      managementService.enrollStudent(payload),
    onSuccess: (data) => {
      toast.success(
        `Successfully enrolled student "${data.student.name || data.student.email}" in "${data.course.title}"`,
      );

      void queryClient.invalidateQueries({ queryKey: ["courses"] });
      void queryClient.invalidateQueries({ queryKey: ["adminDashboardAnalytics"] });
    },
    onError: (error: Error & { message?: string }) => {
      console.error("Enrollment error:", error);
      toast.error(error.message || "Failed to enroll student.");
    },
  });
}
