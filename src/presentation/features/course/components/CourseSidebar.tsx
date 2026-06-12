import { Link } from "@tanstack/react-router";
import {
  Heart,
  BookOpen,
  Video,
  Award,
  Download,
  MessageCircle,
  Layers,
  ShieldCheck,
  Infinity as InfinityIcon,
  Smartphone,
  Link as LinkIcon,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import { MagicBentoCard } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import type { Course } from "../types";
import { formatPrice } from "./utils";

const sidebarFeatures = [
  { icon: ShieldCheck, label: "30 Days Money-back Guarantee" },
  { icon: InfinityIcon, label: "Lifetime Access" },
  { icon: Smartphone, label: "Access on Mobile and TV" },
  { icon: Award, label: "Certificate of Completion" },
  { icon: Download, label: "Downloadable Resources" },
  { icon: MessageCircle, label: "24/7 Community Support" },
];

function mapIncludeIcon(feature: string) {
  const lower = feature.toLowerCase();
  if (lower.includes("video") || lower.includes("hour")) return Video;
  if (lower.includes("certificat")) return Award;
  if (lower.includes("access")) return InfinityIcon;
  if (lower.includes("download") || lower.includes("resource")) return Download;
  if (lower.includes("support") || lower.includes("community")) return MessageCircle;
  if (lower.includes("project") || lower.includes("exercise")) return Layers;
  return BookOpen;
}

interface CourseSidebarProps {
  course: Course;
  slug: string;
}

export function CourseSidebar({ course, slug }: CourseSidebarProps) {
  const glow = useAccentRgb();

  const coursePrice = formatPrice(course.price, course.currency);
  const courseOriginalPrice = course.discountPrice
    ? formatPrice(course.discountPrice, course.currency)
    : null;
  const courseDiscountPct =
    course.discountPrice && course.price > course.discountPrice
      ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
      : null;

  return (
    <aside className="flex flex-col gap-5">
      <MagicBentoCard
        className="rounded-2xl border border-border bg-card p-5"
        glowColor={glow}
        enableStars={false}
        enableMagnetism={false}
      >
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold">{coursePrice}</span>
          {courseOriginalPrice && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {courseOriginalPrice}
              </span>
              {courseDiscountPct && (
                <span className="text-sm font-bold text-emerald-400">{courseDiscountPct}% OFF</span>
              )}
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-rose-400">Limited time offer! Price will increase soon.</p>

        <Link
          to="/learn/$slug"
          params={{ slug }}
          className="mt-4 block w-full rounded-lg bg-[image:var(--gradient-primary)] py-3 text-center text-sm font-semibold text-primary-foreground shadow-[var(--shadow-primary)] transition-transform hover:scale-[1.01]"
        >
          Enroll Now
        </Link>
        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-transparent py-3 text-sm font-medium text-foreground hover:bg-foreground/[0.04]">
          <Heart className="h-4 w-4 text-rose-400" /> Add to Wishlist
        </button>
        <button className="mt-2 w-full rounded-lg border border-border bg-transparent py-3 text-sm font-semibold text-foreground hover:bg-foreground/[0.04]">
          Buy Now
        </button>

        <ul className="mt-5 space-y-3 border-t border-border pt-5">
          {sidebarFeatures.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-sm text-foreground/85">
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </li>
          ))}
        </ul>

        {course.courseIncludes && course.courseIncludes.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-3 text-sm font-semibold">This course includes:</div>
            <ul className="space-y-2.5">
              {course.courseIncludes.map((feature, idx) => {
                const Icon = mapIncludeIcon(feature);
                return (
                  <li key={idx} className="flex items-center gap-2.5 text-sm text-foreground/80">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {feature}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </MagicBentoCard>

      <MagicBentoCard
        className="rounded-2xl border border-primary/40 bg-primary-soft p-5"
        glowColor={glow}
        enableStars={false}
        enableMagnetism={false}
      >
        <div className="text-sm font-semibold">Share this course</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Share with your friends and learn together.
        </p>
        <div className="mt-3 flex gap-2">
          {[LinkIcon, Twitter, Facebook, Linkedin].map((Icon, i) => (
            <button
              key={i}
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card/50 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </MagicBentoCard>
    </aside>
  );
}
