import type { Course, Chapter } from "../types";

export function computeAverageRating(reviews: Course["reviews"]): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

export function formatDurationShort(seconds: number): string {
  if (!seconds || seconds === 0) return "0 mins";
  if (seconds < 3600) {
    const mins = Math.round(seconds / 60);
    return `${mins} mins`;
  }
  const hours = (seconds / 3600).toFixed(2);
  const cleanHours = parseFloat(hours);
  return `${cleanHours} hrs`;
}

export function formatChapterDuration(seconds: number | null): string {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// ─── Price ─────────────────────────────────────────────────────────────────

export function formatPrice(price: number, currency: string): string {
  if (currency === "INR") return `₹${price.toLocaleString("en-IN")}`;
  return `$${price.toFixed(2)}`;
}

export const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  BEGINNER_TO_ADVANCED: "Beginner to Advanced",
};

import { Video, FileText, HelpCircle, BookOpen, TerminalSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function getChapterIcon(type: Chapter["type"]): LucideIcon {
  switch (type) {
    case "VIDEO":
      return Video;
    case "DOCUMENT":
      return FileText;
    case "QUIZ":
      return HelpCircle;
    case "PLAYGROUND":
      return TerminalSquare;
    default:
      return BookOpen;
  }
}
