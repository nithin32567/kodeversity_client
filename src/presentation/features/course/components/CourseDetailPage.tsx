import { useState, useMemo } from "react";
import { Link, useRouteContext } from "@tanstack/react-router";
import {
  Play,
  ChevronRight,
  Check,
  Star,
  Users,
  Home,
  BarChart3,
  Clock,
  BookOpen,
  Layers,
  Award,
  AlertCircle,
} from "lucide-react";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { AppShell } from "@/presentation/global/AppShell";
import { useCourse } from "../hooks/useCourses";
import type { Course } from "../types";
import { computeAverageRating, formatDuration, levelLabel } from "./utils";
import { StatBox } from "./StatBox";
import { CourseSidebar } from "./CourseSidebar";
import { CourseCurriculum } from "./CourseCurriculum";
import { CourseReviews } from "./CourseReviews";

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

function CourseDetailSkeleton() {
  return (
    <AppShell activeTop="Courses">
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
    </AppShell>
  );
}

function CourseDetailError({ slug }: { slug: string }) {
  return (
    <AppShell activeTop="Courses">
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
    </AppShell>
  );
}

interface CourseDetailPageProps {
  slug: string;
}

export function CourseDetailPage({ slug }: CourseDetailPageProps) {
  const { data: course, isLoading, isError } = useCourse(slug);
  const [activeTab, setActiveTab] = useState("Overview");
  const glow = useAccentRgb();

  const reviews = useMemo(() => course?.reviews ?? [], [course]);
  const totalReviews = reviews.length;
  const averageRating = useMemo(() => computeAverageRating(reviews), [reviews]);

  if (isLoading) return <CourseDetailSkeleton />;
  if (isError || !course) return <CourseDetailError slug={slug} />;

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

  return (
    <AppShell activeTop="Courses">
      <main className="relative min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {}
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
              {}
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

                {}
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

              {}
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

              {}
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

              {}
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
                        </div>
                      </>
                    )}
                  </>
                )}

                {activeTab === "Curriculum" && <CourseCurriculum modules={course.modules ?? []} />}

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

                {activeTab === "Reviews" && <CourseReviews reviews={reviews} />}

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

              {}
              {activeTab !== "Reviews" && reviews.length > 0 && (
                <MagicBentoCard
                  className="rounded-2xl border border-border bg-card p-6 md:p-7"
                  glowColor={glow}
                  enableStars={false}
                  enableMagnetism={false}
                >
                  <CourseReviews reviews={reviews} preview />
                </MagicBentoCard>
              )}
            </div>

            {}
            <CourseSidebar course={course} slug={slug} />
          </MagicBentoSection>
        </div>
      </main>
    </AppShell>
  );
}
