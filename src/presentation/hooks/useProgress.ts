import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { progressService } from "@/infrastructure/progress/progressService";

/** Fetch progress for a specific course. */
export function useCourseProgress(courseSlug: string) {
  return useQuery({
    queryKey: ["progress", courseSlug],
    queryFn: () => progressService.getCourseProgress(courseSlug),
    enabled: !!courseSlug,
  });
}

/** Mutation to mark a lesson as complete. Invalidates progress cache on success. */
export function useMarkLessonComplete(courseSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => progressService.markLessonComplete(courseSlug, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", courseSlug] });
    },
  });
}

/** Fetch all earned certificates. */
export function useCertificates() {
  return useQuery({
    queryKey: ["certificates"],
    queryFn: () => progressService.getCertificates(),
    staleTime: 10 * 60 * 1000,
  });
}
