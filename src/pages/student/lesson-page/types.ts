import type { PlaygroundConfig } from "@/domain/playground";

export type LessonStatus = "done" | "current" | "locked";

export interface ChapterDisplay {
  id: string;
  title: string;
  duration?: number;
  durationInSeconds?: number | null;
  status?: string;
  type?: string;
  videoUrl?: string;
  documentUrl?: string;
  playgroundConfig?: PlaygroundConfig;
  isLocked?: boolean;
  progress?: number;
}
