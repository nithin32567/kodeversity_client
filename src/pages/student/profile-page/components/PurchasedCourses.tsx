import { Link } from "react-router-dom";
import { BookOpen, Award, ArrowRight, Clock, Play } from "lucide-react";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/global/MagicBento";
import type { StudentEnrollment } from "@/infrastructure/student/studentService";
import type { Course } from "@/domain/course";
import { useGetMyCourseProgressQuery, useGetCourseBySlugQuery } from "@/features/course/courseApi";
import { formatDurationShort } from "@/presentation/features/course/components/utils";

interface PurchasedCourse extends StudentEnrollment {
  course?: Course;
}

interface PurchasedCoursesProps {
  purchasedCourses: PurchasedCourse[];
  glow: string;
}

function PurchasedCourseCard({ enroll, glow }: { enroll: PurchasedCourse; glow: string }) {
  const { data: fullCourse } = useGetCourseBySlugQuery(enroll.course?.slug || "", {
    skip: !enroll.course?.slug,
  });

  const { data: progressData } = useGetMyCourseProgressQuery(enroll.courseId, {
    skip: !enroll.courseId,
  });

  const courseToUse = fullCourse || enroll.course;

  // Calculate accurate duration
  let accurateDuration = courseToUse?.modules?.reduce(
    (acc, mod) =>
      acc +
      (mod.chapters?.reduce((cAcc, ch) => cAcc + (ch.durationInSeconds || ch.duration || 0), 0) ||
        0),
    0,
  );
  if (!accurateDuration || accurateDuration === 0) {
    accurateDuration = courseToUse?.totalDuration || 0;
  }
  const hoursStr = formatDurationShort(accurateDuration);

  // Calculate accurate progress
  let accurateProgress = enroll.completedPercent || 0;
  if (progressData?.data && courseToUse?.modules) {
    let watchedSum = 0;
    const progressMap = new Map<string, { watchTime: number; percentage: number }>();
    progressData.data.forEach((p) => {
      progressMap.set(p.lessonId, { watchTime: p.watchTime, percentage: p.percentage });
    });

    courseToUse.modules.forEach((mod) => {
      mod.chapters?.forEach((ch) => {
        const entry = progressMap.get(ch.id);
        if (entry) {
          if (entry.percentage >= 90) {
            watchedSum += ch.durationInSeconds || ch.duration || 0;
          } else {
            watchedSum += entry.watchTime || 0;
          }
        }
      });
    });

    if (accurateDuration > 0) {
      accurateProgress = (watchedSum / accurateDuration) * 100;
    }
  }

  accurateProgress = Math.min(100, Math.max(0, accurateProgress));

  return (
    <MagicBentoCard
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)]"
      glowColor={glow}
      enableTilt
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl border border-border overflow-hidden shrink-0 bg-gradient-to-br from-[var(--accent-cyan)]/5 to-[var(--accent-violet)]/5">
        {enroll.course?.thumbnailUrl ? (
          <img
            src={enroll.course.thumbnailUrl}
            alt={enroll.course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 mix-blend-luminosity group-hover:mix-blend-normal"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-[var(--accent-cyan)]/50" />
          </div>
        )}
        <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md text-white rounded-full border border-white/20">
          {enroll.course?.level || "Beginner"}
        </span>
      </div>

      {/* Course Info */}
      <div className="mt-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h4 className="font-bold text-lg leading-tight text-foreground line-clamp-1 group-hover:text-[var(--accent-cyan)] transition-colors">
            {enroll.course?.title}
          </h4>
          <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground line-clamp-2">
            {enroll.course?.subtitle || "Self-paced expert curriculum program."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-border/60 text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[var(--accent-violet)]" />
            <span>{hoursStr}</span>
          </div>
          <div className="text-right">
            <span>
              Paid: <strong className="text-foreground">${enroll.pricePaid}</strong>
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
            <span>Learning Progress</span>
            <span className="font-bold text-foreground">
              {Math.round(accurateProgress)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] rounded-full transition-all duration-500"
              style={{ width: `${accurateProgress}%` }}
            />
          </div>
        </div>

        <Link
          to={`/student/courses/${enroll.course?.slug}`}
          className="group/btn mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_var(--accent-cyan)]"
        >
          <span>Resume Learning</span>
          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
        </Link>
      </div>
    </MagicBentoCard>
  );
}

export function PurchasedCourses({ purchasedCourses, glow }: PurchasedCoursesProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight font-mono uppercase flex items-center gap-3 text-foreground">
            <BookOpen className="h-6 w-6 text-[var(--accent-cyan)]" />
            Purchased Courses ({purchasedCourses.length})
          </h3>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2">
            Your enrolled bootcamps, courses, and progress.
          </p>
        </div>
      </div>

      {purchasedCourses.length === 0 ? (
        <article className="group relative flex flex-col rounded-2xl border border-dashed border-border bg-card/10 p-16 text-center transition-all hover:border-[var(--accent-cyan)]/50 hover:bg-[var(--accent-cyan)]/5 items-center justify-center">
          <Award className="h-12 w-12 text-muted-foreground/45 mb-4 group-hover:text-[var(--accent-cyan)]/60 transition-colors" />
          <h3 className="font-bold text-base text-foreground/80 font-mono tracking-tight uppercase">
            No active purchases found
          </h3>
          <p className="text-[10px] font-mono tracking-widest text-muted-foreground mt-2 max-w-sm uppercase">
            It seems you haven't bought or registered in any courses yet.
          </p>
          <Link
            to="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.02] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/90 transition-colors hover:border-[var(--accent-cyan)]/40 hover:text-[var(--accent-cyan)]"
          >
            Browse Course Catalog <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </article>
      ) : (
        <MagicBentoSection
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          glowColor={glow}
        >
          {purchasedCourses.map((enroll) => (
            <PurchasedCourseCard key={enroll.id} enroll={enroll} glow={glow} />
          ))}
        </MagicBentoSection>
      )}
    </div>
  );
}
