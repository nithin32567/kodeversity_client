import type { Course, Chapter } from "../types";

// ─── Rating ────────────────────────────────────────────────────────────────

export function computeAverageRating(reviews: Course["reviews"]): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

// ─── Duration ──────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  return hours > 0 ? `${hours} Hours` : "<1 Hour";
}

export function formatDurationShort(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  return hours > 0 ? `${hours}` : "<1";
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

// ─── Labels ────────────────────────────────────────────────────────────────

export const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  BEGINNER_TO_ADVANCED: "Beginner to Advanced",
};

// ─── Chapter icons ─────────────────────────────────────────────────────────

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
