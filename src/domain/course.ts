export interface Course {
  slug: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  tags?: string[];
  level?: "beginner" | "intermediate" | "advanced";
  totalLessons?: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  content?: string;
  order: number;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
  tags?: string[];
  starterCode?: Record<string, string>; // language -> starter code
}

export interface Submission {
  id: string;
  challengeId: string;
  status: "pending" | "accepted" | "rejected" | "error";
  output?: string;
  executionTimeMs?: number;
  submittedAt: string;
}
