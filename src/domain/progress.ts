export interface CourseProgress {
  courseSlug: string;
  completedLessonIds: string[];
  totalLessons: number;
  percentComplete: number;
  completedAt?: string;
}

export interface Certificate {
  id: string;
  courseSlug: string;
  courseTitle: string;
  issuedAt: string;
  certificateUrl: string;
}
