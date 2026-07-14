import type { ChapterType } from "@/domain/course";
import { LessonStatus } from "./types";

export const mockModules = [
  {
    id: "mod-1",
    title: "Module 1: Introduction",
    open: true,
    done: 3,
    total: 5,
    chapters: [
      {
        id: "chap-1",
        title: "Welcome to the course",
        duration: 312,
        status: "done" as LessonStatus,
        type: "VIDEO" as ChapterType,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        id: "chap-2",
        title: "Setup tools and environment",
        duration: 465,
        status: "done" as LessonStatus,
        type: "DOCUMENT" as ChapterType,
        documentUrl:
          "https://raw.githubusercontent.com/mdn/beginner-html-site-scripted/master/index.html",
      },
      {
        id: "chap-3",
        title: "React basics",
        duration: 1110,
        status: "current" as LessonStatus,
        type: "VIDEO" as ChapterType,
        videoUrl: "https://www.w3schools.com/html/movie.mp4",
      },
      {
        id: "chap-4",
        title: "Interactive Lab Playground",
        duration: 1500,
        status: "locked" as LessonStatus,
        type: "PLAYGROUND" as ChapterType,
        playgroundConfig: {
          pg: "6659f131a9de4f16462740bc",
          pgname: "1VMPG",
          playground: "ubuntu2404n1",
          difficulty: "easy" as const,
          maxScore: 100,
        },
      },
      {
        id: "chap-5",
        title: "Components and Props",
        duration: 940,
        status: "locked" as LessonStatus,
        type: "VIDEO" as ChapterType,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
    ],
  },
  {
    id: "mod-2",
    title: "Module 2: Components Deep Dive",
    open: true,
    done: 0,
    total: 3,
    chapters: [
      {
        id: "chap-6",
        title: "State and Lifecycle",
        duration: 990,
        status: "locked" as LessonStatus,
        type: "VIDEO" as ChapterType,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        id: "chap-7",
        title: "Docker Engine Lab",
        duration: 1800,
        status: "locked" as LessonStatus,
        type: "PLAYGROUND" as ChapterType,
        playgroundConfig: {
          pg: "665afc8a8b1a8d052a234f9a",
          pgname: "DOCKERPG",
          playground: "ubuntu2404n1-docker",
          difficulty: "medium" as const,
          maxScore: 150,
        },
      },
      {
        id: "chap-8",
        title: "Conditional Rendering",
        duration: 685,
        status: "locked" as LessonStatus,
        type: "VIDEO" as ChapterType,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
    ],
  },
];

export const tabs = ["Overview", "Notes", "Resources", "Q&A", "Reviews (2.1K)"];

export const DIFFICULTY_META = {
  easy: { label: "Easy", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  medium: {
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  hard: { label: "Hard", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  expert: {
    label: "Expert",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
};
