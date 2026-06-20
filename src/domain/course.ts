import type { PlaygroundConfig } from "./playground";

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "BEGINNER_TO_ADVANCED";
export type ChapterType = "VIDEO" | "DOCUMENT" | "QUIZ" | "PLAYGROUND";

export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  designation: string;
  bio: string;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  isPreview: boolean;
  type: ChapterType;
  videoUrl: string | null;
  duration: number | null;
  documentUrl: string | null;
  moduleId: string;
  quizzes: Quiz[];
  playgroundConfig?: PlaygroundConfig | null;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  courseId: string;
  chapters: Chapter[];
}

export interface Company {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  courseId: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
  promoVideoUrl: string | null;
  thumbnailUrl: string | null;
  coverImageUrl?: string | null;
  price: number;
  discountPrice: number | null;
  currency: string;
  level: CourseLevel;
  totalDuration: number;
  lessonsCount: number;
  projectsCount: number;
  hasCertificate: boolean;
  whatYouWillLearn: string[];
  courseIncludes: string[];
  totalStudents: number;
  rating?: number | null;
  isPublished?: boolean;
  enrollmentCount?: number;
  createdAt: string;
  updatedAt: string;
  instructorId?: string | null;
  instructor?: Instructor;
  modules?: Module[];
  companies?: Company[];
  reviews?: Review[];
}

export type LessonType = "VIDEO" | "QUIZ" | "PLAYGROUND";

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration: string;
  videoUrl?: string;
  content?: string;
  order: number;
  type?: LessonType;
  playgroundConfig?: PlaygroundConfig | null;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
  tags?: string[];
  starterCode?: Record<string, string>;
}

export interface Submission {
  id: string;
  challengeId: string;
  status: "pending" | "accepted" | "rejected" | "error";
  output?: string;
  executionTimeMs?: number;
  submittedAt: string;
}
