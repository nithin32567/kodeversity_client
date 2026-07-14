import type { CourseLevel } from "@/domain/course";

export const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  BEGINNER_TO_ADVANCED: "All Levels",
};

export const initialFormState = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  thumbnailUrl: "",
  promoVideoUrl: "",
  price: "",
  discountPrice: "",
  currency: "USD",
  level: "BEGINNER" as CourseLevel,
  totalDuration: "60",
  lessonsCount: "10",
  projectsCount: "2",
  hasCertificate: true,
  whatYouWillLearnRaw:
    "Master the fundamentals\nBuild hands-on projects\nUnderstand advanced patterns",
  courseIncludesRaw: "On-demand videos\nHands-on assignments\nCertificate of completion",
  instructorId: "",
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
