import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Play,
  Check,
  Star,
  Users,
  BarChart3,
  Clock,
  BookOpen,
  Layers,
  Award,
  AlertCircle,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { useCourse } from "@/presentation/features/student-learning/hooks/useCourses";
import { useGetMyCourseProgressQuery } from "@/features/course/courseApi";
import { StatBox } from "@/presentation/features/course/components/StatBox";
import { CourseCurriculum } from "@/presentation/features/course/components/CourseCurriculum";
import { CourseReviews } from "@/presentation/features/course/components/CourseReviews";
import {
  computeAverageRating,
  formatDuration,
  levelLabel,
} from "@/presentation/features/course/components/utils";

function CourseDetailSkeleton() {
  return (
    <main className="relative flex-1 w-full overflow-hidden bg-background py-8 md:py-12 animate-pulse">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
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

function CourseDetailError({ slug }: { slug: string }) {
  return (
    <main className="relative flex-1 w-full overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 text-center flex flex-col items-center justify-center min-h-[500px]">
        <AlertCircle className="h-16 w-16 text-rose-500 mb-4 animate-bounce" />
        <h1 className="font-display text-2xl font-bold md:text-3xl text-foreground">
          Course Not Found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          The course with slug "{slug}" does not exist, or could not be loaded.
        </p>
        <div className="mt-6">
          <Link
            to="/student/courses"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    </main>
  );
}

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, isLoading, isError } = useCourse(slug || "");
  const [activeTab, setActiveTab] = useState("Overview");
  const glow = useAccentRgb();

  const reviews = useMemo(() => course?.reviews ?? [], [course]);
  const totalReviews = reviews.length;
  const averageRating = useMemo(() => computeAverageRating(reviews), [reviews]);

  const { data: progressData } = useGetMyCourseProgressQuery(course?.id || "", {
    skip: !course?.id,
  });

  const resumeLessonId = useMemo(() => {
    if (!course || !course.modules || course.modules.length === 0) return null;

    const sortedModules = [...course.modules].sort((a, b) => a.sortOrder - b.sortOrder);
    const allChapters = sortedModules.flatMap((m) =>
      m.chapters ? [...m.chapters].sort((a, b) => a.sortOrder - b.sortOrder) : []
    );

    if (allChapters.length === 0) return null;

    const completedSet = new Set<string>();

    if (progressData?.data) {
      progressData.data.forEach((p: any) => {
        if (p.isCompleted) completedSet.add(p.lessonId);
      });
    }

    try {
      const lsRaw = localStorage.getItem(`lms:progress:${course.id}`);
      if (lsRaw) {
        const lsStore = JSON.parse(lsRaw);
        for (const [id, entry] of Object.entries(lsStore)) {
          if ((entry as any).isCompleted) completedSet.add(id);
        }
      }
    } catch {
      // ignore
    }

    for (const ch of allChapters) {
      if (!completedSet.has(ch.id)) {
        return ch.id;
      }
    }

    return allChapters[allChapters.length - 1].id;
  }, [course, progressData]);

  if (isLoading) return <CourseDetailSkeleton />;
  if (isError || !course) return <CourseDetailError slug={slug || ""} />;

  let accurateProgress = 0;
  if (progressData?.data && course?.modules) {
    let totalWeight = 0;
    let earnedWeight = 0;

    const progressMap = new Map<string, { watchTime: number; percentage: number; isCompleted: boolean }>();
    progressData.data.forEach((p: any) => {
      progressMap.set(p.lessonId, { watchTime: p.watchTime, percentage: p.percentage, isCompleted: p.isCompleted });
    });

    course.modules.forEach((mod) => {
      mod.chapters?.forEach((ch) => {
        const chDur = ch.durationInSeconds || ch.duration || 0;
        const weight = chDur > 0 ? chDur : 100; // Text chapters count as 100 units of weight
        totalWeight += weight;

        const entry = progressMap.get(ch.id);
        const isChCompleted = entry && (entry.percentage >= 90 || entry.isCompleted);

        if (isChCompleted) {
          earnedWeight += weight;
        } else if (entry && chDur > 0) {
          earnedWeight += entry.watchTime || 0;
        }
      });
    });

    if (totalWeight > 0) {
      accurateProgress = (earnedWeight / totalWeight) * 100;
    }
  }

  accurateProgress = Math.min(100, Math.max(0, Math.round(accurateProgress)));

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
  ];

  return (
    <main className="relative flex-1 w-full overflow-hidden bg-background py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <Link
          to="/student/courses"
          className="group/btn inline-flex w-fit items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-muted-foreground hover:text-[var(--accent-cyan)] transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover/btn:-translate-x-1" />{" "}
          Back to My Courses
        </Link>

        <MagicBentoSection
          className="grid gap-6 lg:grid-cols-[1fr_360px]"
          glowColor={glow}
          spotlightRadius={400}
        >
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <section className="flex flex-col">
                <span className="mb-4 inline-flex w-fit items-center rounded-md bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold tracking-wider text-emerald-400">
                  ENROLLED
                </span>
                <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-[2rem]">
                  {course.title}
                </h1>
                {course.subtitle && (
                  <p className="mt-2 text-sm font-medium text-[var(--accent-cyan)]">
                    {course.subtitle}
                  </p>
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
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[var(--accent-cyan)]/40 to-[var(--accent-violet)]/40 text-xs font-semibold text-foreground ring-2 ring-border">
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
                      <div className="flex gap-0.5 text-[var(--accent-cyan)]">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < Math.round(averageRating) ? "fill-current" : ""
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
                    <Users className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
                    {course.totalStudents.toLocaleString()} Students
                  </div>
                </div>
              </section>

              <MagicBentoCard
                className="h-fit overflow-hidden rounded-xl border border-border bg-card"
                glowColor={glow}
                enableStars={false}
                enableMagnetism={false}
              >
                <div
                  className="relative grid  aspect-video w-full place-items-center"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, color-mix(in oklab, var(--accent-violet) 35%, #0b0a1f) 0%, #06050f 70%)",
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
                            className="absolute inset-0 rounded-full border-2 border-[var(--accent-cyan)]/70"
                            style={{ transform: `rotate(${rot}deg) scaleY(0.38)` }}
                          />
                        ))}
                      </div>
                      <div className="relative grid h-3 w-3 place-items-center rounded-full bg-[var(--accent-cyan)]" />
                      {resumeLessonId && (
                        <Link
                          to={`/student/courses/${slug}/lessons/${resumeLessonId}`}
                          aria-label="Play"
                          className="absolute grid h-14 w-14 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition hover:scale-110"
                        >
                          <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
                {/* <div className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-muted-foreground">
                  <GraduationCap className="h-3 w-3" />
                  <span>Start Learning</span>
                </div> */}
              </MagicBentoCard>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatBox
                icon={<BarChart3 className="h-4 w-4" />}
                value={course.level ? (levelLabel[course.level] ?? course.level) : "N/A"}
                label="Level"
              />
              <StatBox
                icon={<Clock className="h-4 w-4" />}
                value={durationFormatted || "0m"}
                label="Duration"
              />
              <StatBox
                icon={<BookOpen className="h-4 w-4" />}
                value={`${course.lessonsCount || 0} Lessons`}
                label="Content"
              />
              <StatBox
                icon={<Layers className="h-4 w-4" />}
                value={`${course.projectsCount || 0} Projects`}
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
                    className={`relative -mb-px py-3 text-sm transition-colors ${active
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {t}
                    {active && (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--accent-cyan)]" />
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
                </>
              )}

              {activeTab === "Curriculum" && <CourseCurriculum modules={course.modules ?? []} />}

              {activeTab === "Projects" && (
                <div className="space-y-4">
                  <h2 className="font-display text-lg font-semibold">Hands-on Projects</h2>
                  <p className="text-sm text-muted-foreground">
                    This course includes {course.projectsCount} industry-grade projects. Apply what
                    you learn by building real portfolio-worthy software.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    {Array.from({ length: Math.max(1, course.projectsCount) }).map((_, i) => (
                      <div key={i} className="rounded-xl border border-border bg-card/40 p-4">
                        <h3 className="font-display text-sm font-bold text-[var(--accent-cyan)]">
                          Project {i + 1}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          An end-to-end practical application built using the core concepts learned
                          throughout the modules of this course.
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
                      <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[var(--accent-cyan)]/40 to-[var(--accent-violet)]/40 text-xl font-bold text-foreground ring-2 ring-border">
                        {initials}
                      </div>
                    )}
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">
                        {instructorName}
                      </h3>
                      <p className="text-xs text-[var(--accent-cyan)] font-medium">
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
            </MagicBentoCard>
          </div>

          <aside className="flex flex-col gap-5">
            <MagicBentoCard
              className="rounded-2xl border border-border bg-card p-5"
              glowColor={glow}
              enableStars={false}
              enableMagnetism={false}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground">Course Access</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                  Enrolled
                </span>
              </div>

              {resumeLessonId ? (
                <Link
                  to={`/student/courses/${slug}/lessons/${resumeLessonId}`}
                  className="group/btn block w-full rounded-lg bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_var(--accent-cyan)]"
                >
                  Continue Course
                </Link>
              ) : (
                <button
                  disabled
                  className="block w-full rounded-lg bg-muted py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground cursor-not-allowed"
                >
                  No Lessons Yet
                </button>
              )}
            </MagicBentoCard>
          </aside>
        </MagicBentoSection>
      </div>
    </main>
  );
}
