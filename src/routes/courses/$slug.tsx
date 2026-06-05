import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Play,
  ChevronRight,
  Heart,
  Check,
  Star,
  Users,
  Home,
  Link as LinkIcon,
  Twitter,
  Facebook,
  Linkedin,
  ShieldCheck,
  Infinity as InfinityIcon,
  Smartphone,
  Award,
  Download,
  MessageCircle,
  Video,
  BookOpen,
  Layers,
  ThumbsUp,
  BarChart3,
  Clock,
  ChevronDown,
  MoreHorizontal,
  FileText,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { AppShell } from "@/presentation/global/AppShell";
import { StudentLayout } from "@/presentation/global/layouts/StudentLayout";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { useCourse } from "@/presentation/features/student-learning/hooks/useCourses";
import type { Course, Chapter } from "@/domain/course";

export const Route = createFileRoute("/courses/$slug")({
  loader: ({ params }) => {
    return { slug: params.slug };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.slug ? "Course Detail" : "Course"} — Kodeversity` },
      {
        name: "description",
        content: "Course details on Kodeversity.",
      },
    ],
  }),
  component: CourseDetailPage,
});

const sidebarFeatures = [
  { icon: ShieldCheck, label: "30 Days Money-back Guarantee" },
  { icon: InfinityIcon, label: "Lifetime Access" },
  { icon: Smartphone, label: "Access on Mobile and TV" },
  { icon: Award, label: "Certificate of Completion" },
  { icon: Download, label: "Downloadable Resources" },
  { icon: MessageCircle, label: "24/7 Community Support" },
];

const faqs = [
  {
    q: "When does the course start and finish?",
    a: "The course starts now and never ends! It is a completely self-paced online course - you decide when you start and when you finish.",
  },
  {
    q: "How long do I have access to the course?",
    a: "How does lifetime access sound? After enrolling, you have unlimited access to this course for as long as you like - across any and all devices you own.",
  },
  {
    q: "What if I am unhappy with the course?",
    a: "We would never want you to be unhappy! If you are unsatisfied with your purchase, contact us in the first 30 days and we will give you a full refund.",
  },
];

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  BEGINNER_TO_ADVANCED: "Beginner to Advanced",
};

function formatDuration(seconds: number): string {
  const hours = Math.round(seconds / 3600);
  return hours > 0 ? `${hours} Hours` : "<1 Hour";
}

function formatChapterDuration(seconds: number | null): string {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function getChapterIcon(type: Chapter["type"]) {
  switch (type) {
    case "VIDEO":
      return Video;
    case "DOCUMENT":
      return FileText;
    case "QUIZ":
      return HelpCircle;
    default:
      return BookOpen;
  }
}

function computeAverageRating(reviews: Course["reviews"]): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

function formatPrice(price: number, currency: string): string {
  if (currency === "INR") return `₹${price.toLocaleString("en-IN")}`;
  return `$${price.toFixed(2)}`;
}

function CourseDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const isStudent = isAuthenticated && user?.role === "STUDENT";

  const wrapLayout = (children: React.ReactNode) => {
    if (isStudent) {
      return <StudentLayout>{children}</StudentLayout>;
    }
    return <AppShell activeTop="Courses">{children}</AppShell>;
  };

  const { slug } = Route.useLoaderData();
  const { data: course, isLoading, isError } = useCourse(slug);
  const [activeTab, setActiveTab] = useState("Overview");
  const glow = useAccentRgb();

  const reviews = useMemo(() => course?.reviews ?? [], [course]);
  const totalReviews = reviews.length;

  const averageRating = useMemo(() => computeAverageRating(reviews), [reviews]);

  const ratingBreakdown = useMemo(() => {
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rating = Math.min(5, Math.max(1, Math.round(r.rating)));
      starCounts[rating as 1 | 2 | 3 | 4 | 5]++;
    });
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = starCounts[stars as 1 | 2 | 3 | 4 | 5];
      const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
      return { stars, pct };
    });
  }, [reviews, totalReviews]);

  if (isLoading) {
    return wrapLayout(
      <main className="relative min-h-screen bg-background text-foreground animate-pulse">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <div className="mb-5 h-4 w-48 rounded bg-foreground/10" />
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <div className="h-6 w-24 rounded bg-foreground/10" />
                  <div className="h-10 w-3/4 rounded bg-foreground/10" />
                  <div className="h-4 w-full rounded bg-foreground/10" />
                  <div className="h-4 w-5/6 rounded bg-foreground/10" />
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-foreground/10" />
                    <div className="h-4 w-28 rounded bg-foreground/10" />
                  </div>
                </div>
                <div className="aspect-video rounded-xl bg-foreground/10" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-foreground/10" />
                ))}
              </div>
            </div>
            <div className="h-[400px] rounded-2xl bg-foreground/10" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !course) {
    return wrapLayout(
      <main className="relative min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 text-center flex flex-col items-center justify-center min-h-[500px]">
          <AlertCircle className="h-16 w-16 text-rose-500 mb-4 animate-bounce" />
          <h1 className="font-display text-2xl font-bold md:text-3xl text-foreground">
            Course Not Found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            The course with slug "{slug}" does not exist, or could not be loaded from the backend.
          </p>
          <div className="mt-6">
            <Link
              to="/courses"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const coursePrice = formatPrice(course.price, course.currency);
  const courseOriginalPrice = course.discountPrice
    ? formatPrice(course.discountPrice, course.currency)
    : null;
  const courseDiscountPct =
    course.discountPrice && course.price > course.discountPrice
      ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
      : null;

  const durationFormatted = formatDuration(course.totalDuration);
  const instructorName = course.instructor?.name ?? "Instructor";
  const initials = instructorName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const tabsList = [
    "Overview",
    "Curriculum",
    "Projects",
    "Instructor",
    `Reviews (${totalReviews})`,
    "FAQs",
  ];

  return wrapLayout(
    <main className="relative min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <nav className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <Link to="/courses" className="hover:text-foreground">
              Courses
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="hover:text-foreground">
              {levelLabel[course.level] ?? course.level}
            </span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{course.title}</span>
          </nav>

          <MagicBentoSection
            className="grid gap-6 lg:grid-cols-[1fr_360px]"
            glowColor={glow}
            spotlightRadius={400}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <section className="flex flex-col">
                  <span className="mb-4 inline-flex w-fit items-center rounded-md bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold tracking-wider text-emerald-400">
                    BESTSELLER
                  </span>
                  <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-[2rem]">
                    {course.title}
                  </h1>
                  {course.subtitle && (
                    <p className="mt-2 text-sm font-medium text-primary">{course.subtitle}</p>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2.5">
                    {course.instructor?.avatarUrl ? (
                      <img
                        src={course.instructor.avatarUrl}
                        alt={instructorName}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
                      />
                    ) : (
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary/40 to-primary/10 text-xs font-semibold text-foreground ring-2 ring-border">
                        {initials}
                      </div>
                    )}
                    <div className="leading-tight">
                      <div className="text-sm font-semibold">{instructorName}</div>
                      <div className="text-xs text-muted-foreground">
                        {course.instructor?.designation ?? "Expert Instructor"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                    {averageRating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5 text-amber-400">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.round(averageRating) ? "fill-current" : ""
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium">
                          {averageRating.toFixed(1)} ({totalReviews} Ratings)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {course.totalStudents.toLocaleString()} Students
                    </div>
                  </div>
                </section>

                <MagicBentoCard
                  className="overflow-hidden rounded-xl border border-border bg-card"
                  glowColor={glow}
                  enableStars={false}
                  enableMagnetism={false}
                >
                  <div
                    className="relative grid aspect-video w-full place-items-center"
                    style={{
                      background: "radial-gradient(ellipse at center, #1e1b4b 0%, #0b0a1f 70%)",
                    }}
                  >
                    {course.thumbnailUrl && !course.promoVideoUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="relative grid h-36 w-36 place-items-center">
                        <div className="absolute inset-0 animate-pulse">
                          {[0, 60, 120].map((rot) => (
                            <div
                              key={rot}
                              className="absolute inset-0 rounded-full border-2 border-primary/70"
                              style={{ transform: `rotate(${rot}deg) scaleY(0.38)` }}
                            />
                          ))}
                        </div>
                        <div className="relative grid h-3 w-3 place-items-center rounded-full bg-primary" />
                        <button
                          aria-label="Play"
                          className="absolute grid h-14 w-14 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition hover:scale-110"
                        >
                          <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-muted-foreground">
                    <Play className="h-3 w-3 fill-current" />
                    <span>Preview this course</span>
                  </div>
                </MagicBentoCard>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <StatBox
                  icon={<BarChart3 className="h-4 w-4" />}
                  value={levelLabel[course.level] ?? course.level}
                  label="Level"
                />
                <StatBox
                  icon={<Clock className="h-4 w-4" />}
                  value={durationFormatted}
                  label="Duration"
                />
                <StatBox
                  icon={<BookOpen className="h-4 w-4" />}
                  value={`${course.lessonsCount} Lessons`}
                  label="Content"
                />
                <StatBox
                  icon={<Layers className="h-4 w-4" />}
                  value={`${course.projectsCount} Projects`}
                  label="Hands-on"
                />
                <StatBox
                  icon={<Award className="h-4 w-4" />}
                  value={course.hasCertificate ? "Included" : "Not Included"}
                  label="Certificate"
                />
              </div>

              <div className="flex flex-wrap gap-x-7 gap-y-2 border-b border-border">
                {tabsList.map((t) => {
                  const cleanedTab = t.split(" ")[0];
                  const cleanedActive = activeTab.split(" ")[0];
                  const active = cleanedTab === cleanedActive;
                  return (
                    <button
                      key={t}
                      onClick={() => setActiveTab(cleanedTab)}
                      className={`relative -mb-px py-3 text-sm transition-colors ${
                        active
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t}
                      {active && (
                        <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>

              <MagicBentoCard
                className="rounded-2xl border border-border bg-card p-6 md:p-7"
                glowColor={glow}
                enableStars={false}
                enableMagnetism={false}
              >
                {activeTab === "Overview" && (
                  <>
                    <h2 className="font-display text-lg font-semibold">What you'll learn</h2>
                    <ul className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                      {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 ? (
                        course.whatYouWillLearn.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-emerald-500/15 p-0.5 text-emerald-400" />
                            <span className="text-foreground/85">{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-muted-foreground">
                          Comprehensive modular curriculum.
                        </li>
                      )}
                    </ul>

                    <div className="my-7 h-px bg-border" />

                    <h2 className="font-display text-lg font-semibold">Course Description</h2>
                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                      <p>{course.description}</p>
                    </div>

                    {course.companies && course.companies.length > 0 && (
                      <>
                        <div className="my-7 h-px bg-border" />
                        <h3 className="text-sm font-semibold text-foreground/90">
                          Top companies our learners work at
                        </h3>
                        <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 text-muted-foreground">
                          {course.companies.map((c) => (
                            <span
                              key={c.id}
                              className="text-base font-semibold tracking-tight opacity-80"
                            >
                              {c.logoUrl ? (
                                <img src={c.logoUrl} alt={c.name} className="h-6 object-contain" />
                              ) : (
                                c.name
                              )}
                            </span>
                          ))}
                          <MoreHorizontal className="h-5 w-5" />
                        </div>
                      </>
                    )}
                  </>
                )}

                {activeTab === "Curriculum" && (
                  <div className="space-y-6">
                    <h2 className="font-display text-lg font-semibold">Course Curriculum</h2>
                    {course.modules && course.modules.length > 0 ? (
                      <div className="space-y-4">
                        {[...course.modules]
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((mod) => (
                            <div
                              key={mod.id}
                              className="rounded-xl border border-border bg-card/40 p-4"
                            >
                              <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center justify-between">
                                <span>{mod.title}</span>
                                <span className="text-xs font-normal text-muted-foreground">
                                  {mod.chapters?.length ?? 0} Chapters
                                </span>
                              </h3>
                              {mod.chapters && mod.chapters.length > 0 ? (
                                <ul className="space-y-2">
                                  {[...mod.chapters]
                                    .sort((a, b) => a.sortOrder - b.sortOrder)
                                    .map((chap) => {
                                      const IconComponent = getChapterIcon(chap.type);
                                      return (
                                        <li
                                          key={chap.id}
                                          className="flex items-center justify-between rounded-lg bg-card/60 p-3 text-sm hover:bg-foreground/[0.02]"
                                        >
                                          <div className="flex items-center gap-3">
                                            <IconComponent className="h-4 w-4 text-primary shrink-0" />
                                            <span className="text-foreground/90 font-medium">
                                              {chap.title}
                                            </span>
                                            {chap.isPreview && (
                                              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                                                Preview
                                              </span>
                                            )}
                                          </div>
                                          {chap.duration ? (
                                            <span className="text-xs text-muted-foreground">
                                              {formatChapterDuration(chap.duration)}
                                            </span>
                                          ) : null}
                                        </li>
                                      );
                                    })}
                                </ul>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  No chapters in this module.
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Curriculum details not available.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "Projects" && (
                  <div className="space-y-4">
                    <h2 className="font-display text-lg font-semibold">Hands-on Projects</h2>
                    <p className="text-sm text-muted-foreground">
                      This course includes {course.projectsCount} industry-grade projects. Apply
                      what you learn by building real portfolio-worthy software.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 mt-4">
                      {Array.from({ length: Math.max(1, course.projectsCount) }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card/40 p-4">
                          <h3 className="font-display text-sm font-bold text-foreground">
                            Project {i + 1}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            An end-to-end practical application built using the core concepts
                            learned throughout the modules of this course.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "Instructor" && (
                  <div className="space-y-4">
                    <h2 className="font-display text-lg font-semibold">Your Instructor</h2>
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      {course.instructor?.avatarUrl ? (
                        <img
                          src={course.instructor.avatarUrl}
                          alt={instructorName}
                          className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                        />
                      ) : (
                        <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary/40 to-primary/10 text-xl font-bold text-foreground ring-2 ring-border">
                          {initials}
                        </div>
                      )}
                      <div>
                        <h3 className="font-display text-base font-bold text-foreground">
                          {instructorName}
                        </h3>
                        <p className="text-xs text-primary font-medium">
                          {course.instructor?.designation}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {course.instructor?.bio ??
                            "Expert instructor guiding you through the course."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Reviews" && (
                  <div className="space-y-6">
                    <h2 className="font-display text-lg font-semibold">Student Reviews</h2>
                    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-5xl font-bold">
                            {averageRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">out of 5</span>
                        </div>
                        <div className="mt-4 space-y-2">
                          {ratingBreakdown.map((r) => (
                            <div key={r.stars} className="flex items-center gap-2 text-xs">
                              <span className="w-3 text-foreground/80">{r.stars}</span>
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
                                <div
                                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                                  style={{ width: `${r.pct}%` }}
                                />
                              </div>
                              <span className="w-8 text-right text-muted-foreground">{r.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {reviews.length > 0 ? (
                          reviews.map((rev) => (
                            <div
                              key={rev.id}
                              className="rounded-xl border border-border bg-card/50 p-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-xs font-semibold text-primary-foreground ring-2 ring-border">
                                  {rev.isVerified ? "V" : "R"}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="text-sm font-semibold">Student</div>
                                      {rev.isVerified && (
                                        <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-emerald-400">
                                          <Check className="h-3 w-3" /> Verified Buyer
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(rev.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="mt-2 flex gap-0.5 text-amber-400">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                      <Star
                                        key={i}
                                        className={`h-3.5 w-3.5 ${
                                          i < rev.rating ? "fill-current" : ""
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <p className="mt-2 text-sm text-foreground/85">{rev.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No student reviews yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "FAQs" && (
                  <div className="space-y-4">
                    <h2 className="font-display text-lg font-semibold">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-4 mt-3">
                      {faqs.map((faq, idx) => (
                        <div key={idx} className="rounded-xl border border-border bg-card/40 p-4">
                          <h3 className="text-sm font-bold text-foreground">{faq.q}</h3>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </MagicBentoCard>

              {activeTab !== "Reviews" && reviews.length > 0 && (
                <MagicBentoCard
                  className="rounded-2xl border border-border bg-card p-6 md:p-7"
                  glowColor={glow}
                  enableStars={false}
                  enableMagnetism={false}
                >
                  <h2 className="font-display text-lg font-semibold">Reviews ({totalReviews})</h2>
                  <div className="mt-5 grid gap-6 md:grid-cols-[260px_1fr]">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-5xl font-bold">
                          {averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">out of 5</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {ratingBreakdown.map((r) => (
                          <div key={r.stars} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-foreground/80">{r.stars}</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
                              <div
                                className="absolute inset-y-0 left-0 rounded-full bg-primary"
                                style={{ width: `${r.pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-muted-foreground">{r.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviews.slice(0, 2).map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-xl border border-border bg-card/50 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-xs font-semibold text-primary-foreground ring-2 ring-border">
                              {rev.isVerified ? "V" : "R"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-semibold">Student</div>
                                  {rev.isVerified && (
                                    <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-emerald-400">
                                      <Check className="h-3 w-3" /> Verified Buyer
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(rev.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="mt-2 flex gap-0.5 text-amber-400">
                                {[0, 1, 2, 3, 4].map((i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                      i < rev.rating ? "fill-current" : ""
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="mt-2 text-sm text-foreground/85">{rev.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </MagicBentoCard>
              )}
            </div>

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
                        <span className="text-sm font-bold text-emerald-400">
                          {courseDiscountPct}% OFF
                        </span>
                      )}
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-rose-400">
                  Limited time offer! Price will increase soon.
                </p>

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
                    <li
                      key={label}
                      className="flex items-center gap-2.5 text-sm text-foreground/85"
                    >
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
                        let Icon = BookOpen;
                        const lower = feature.toLowerCase();
                        if (lower.includes("video") || lower.includes("hour")) Icon = Video;
                        else if (lower.includes("certificat")) Icon = Award;
                        else if (lower.includes("access")) Icon = InfinityIcon;
                        else if (lower.includes("download") || lower.includes("resource"))
                          Icon = Download;
                        else if (lower.includes("support") || lower.includes("community"))
                          Icon = MessageCircle;
                        else if (lower.includes("project") || lower.includes("exercise"))
                          Icon = Layers;

                        return (
                          <li
                            key={idx}
                            className="flex items-center gap-2.5 text-sm text-foreground/80"
                          >
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
          </MagicBentoSection>
        </div>
      </main>
    );
  }

function StatBox({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  const glow = useAccentRgb();
  return (
    <MagicBentoCard
      className="rounded-lg border border-border bg-card px-3 py-2.5"
      glowColor={glow}
      particleCount={6}
      enableTilt
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-primary">{icon}</span>
        <div className="leading-tight">
          <div className="text-[12px] font-semibold text-foreground/90">{value}</div>
          <div className="text-[11px] text-muted-foreground">{label}</div>
        </div>
      </div>
    </MagicBentoCard>
  );
}
