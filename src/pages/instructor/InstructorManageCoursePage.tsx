import { useParams } from "react-router-dom";
import { CourseManagementDashboard } from "@/presentation/features/admin-courses/components/CourseManagementDashboard";

export function InstructorManageCoursePage() {
  const { slug } = useParams<{ slug: string }>();
  return <CourseManagementDashboard slug={slug || ""} />;
}
