import type { Instructor, CourseLevel } from "@/domain/course";

export interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  instructors: Instructor[];
  levels: string[];
}
