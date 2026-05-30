import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Bell,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Maximize,
  Settings,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  Lock,
  FileText,
  ListChecks,
  ClipboardList,
  Folder,
  BarChart3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Award,
  CheckCheck,
} from "lucide-react";
import { findCourseBySlug } from "@/presentation/components/student/courses/data";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/components/ui/MagicBento";
import { AppShell } from "@/presentation/components/student/AppShell";
import { useAccentRgb } from "@/presentation/lib/useAccent";

export const Route = createFileRoute("/_student/learn/$slug")({
  loader: ({ params }) => {
    const course = findCourseBySlug(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Learn: ${loaderData?.course.title ?? "Course"} — Kodeversity` },
      {
        name: "description",
        content: `Learning workspace for ${loaderData?.course.title}.`,
      },
    ],
  }),
  component: LearnPage,
});

type LessonStatus = "done" | "current" | "locked";
interface Lesson {
  n: number;
  title: string;
  duration: string;
  status: LessonStatus;
}
interface Module {
  title: string;
  open: boolean;
  done: number;
  total: number;
  lessons: Lesson[];
}

const modules: Module[] = [
  {
    title: "Module 1: Introduction",
    open: true,
    done: 4,
    total: 5,
    lessons: [
      { n: 1, title: "Welcome to the course", duration: "05:12", status: "done" },
      { n: 2, title: "Setup tools and environment", duration: "07:45", status: "done" },
      { n: 3, title: "React basics", duration: "18:30", status: "current" },
      { n: 4, title: "JSX and Elements", duration: "12:20", status: "locked" },
      { n: 5, title: "Components and Props", duration: "15:40", status: "locked" },
    ],
  },
  {
    title: "Module 2: Components Deep Dive",
    open: true,
    done: 0,
    total: 5,
    lessons: [
      { n: 6, title: "State and Lifecycle", duration: "16:30", status: "locked" },
      { n: 7, title: "Event Handling", duration: "12:10", status: "locked" },
      { n: 8, title: "Conditional Rendering", duration: "11:25", status: "locked" },
      { n: 9, title: "Lists and Keys", duration: "10:15", status: "locked" },
      { n: 10, title: "Forms in React", duration: "13:40", status: "locked" },
    ],
  },
  {
    title: "Module 3: React Router",
    open: false,
    done: 0,
    total: 4,
    lessons: [
      { n: 11, title: "Routing fundamentals", duration: "09:20", status: "locked" },
      { n: 12, title: "Nested routes & layouts", duration: "11:05", status: "locked" },
      { n: 13, title: "Route params & search", duration: "10:30", status: "locked" },
      { n: 14, title: "Data loading patterns", duration: "13:15", status: "locked" },
    ],
  },
  {
    title: "Module 4: State Management",
    open: false,
    done: 0,
    total: 4,
    lessons: [
      { n: 15, title: "Context API in depth", duration: "12:40", status: "locked" },
      { n: 16, title: "Zustand essentials", duration: "10:50", status: "locked" },
      { n: 17, title: "TanStack Query basics", duration: "14:10", status: "locked" },
      { n: 18, title: "Server state vs UI state", duration: "09:55", status: "locked" },
    ],
  },
  {
    title: "Module 5: Projects",
    open: false,
    done: 0,
    total: 3,
    lessons: [
      { n: 19, title: "Build a dashboard", duration: "22:00", status: "locked" },
      { n: 20, title: "Build a chat app", duration: "25:30", status: "locked" },
      { n: 21, title: "Capstone project", duration: "30:00", status: "locked" },
    ],
  },
];

const tabs = ["Overview", "Notes", "Resources", "Q&A", "Reviews (2.1K)"];

function LearnPage() {
  const { course } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState("Overview");
  const [open, setOpen] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: false,
    3: false,
    4: false,
  });
  const glow = useAccentRgb();

  return (
    <AppShell activeTop="Courses" variant="learn">
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-[1600px] px-6 py-6">
          <Link
            to="/courses/$slug"
            params={{
              slug: course.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, ""),
            }}
            className="mb-4 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <MagicBentoSection
            className="grid items-start gap-6 lg:grid-cols-[1fr_360px]"
            glowColor={glow}
            spotlightRadius={400}
          >
            {/* MAIN */}
            <div className="flex flex-col gap-6">
              {/* Video card */}
              <MagicBentoCard
                className="overflow-hidden rounded-2xl border border-border bg-card"
                glowColor={glow}
                enableStars={false}
                enableMagnetism={false}
              >
                <div
                  className="relative grid aspect-[16/8] w-full place-items-center"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, color-mix(in oklab, var(--accent-violet) 35%, #0b0a1f) 0%, #06050f 70%)",
                  }}
                >
                  <button className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur hover:bg-background/80">
                    Next Lesson <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  <div className="absolute left-8 top-1/2 max-w-sm -translate-y-1/2">
                    <p className="text-sm font-medium text-primary">Module 1 · Lesson 3</p>
                    <h1 className="mt-2 font-display text-4xl font-bold text-foreground">
                      React Basics
                    </h1>
                    <p className="mt-2 text-sm text-foreground/70">
                      Understanding the core building blocks of React.
                    </p>
                  </div>

                  {/* Atom-ish play target */}
                  <div className="relative grid h-44 w-44 place-items-center">
                    <div className="absolute inset-0 animate-pulse">
                      {[0, 60, 120].map((rot) => (
                        <div
                          key={rot}
                          className="absolute inset-0 rounded-full border-2 border-[var(--accent-cyan)]/70"
                          style={{ transform: `rotate(${rot}deg) scaleY(0.4)` }}
                        />
                      ))}
                    </div>
                    <div className="relative grid h-3 w-3 place-items-center rounded-full bg-[var(--accent-cyan)]" />
                    <button
                      aria-label="Play"
                      className="absolute grid h-16 w-16 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur transition hover:scale-110"
                    >
                      <Play className="h-7 w-7 translate-x-0.5 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-5 pt-4">
                  <div className="relative h-1 w-full overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[image:var(--gradient-primary)]"
                      style={{ width: "47%" }}
                    />
                    <div
                      className="absolute -top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-primary shadow-[var(--shadow-primary)]"
                      style={{ left: "47%" }}
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between px-5 py-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <button className="hover:text-foreground">
                      <Play className="h-4 w-4 fill-current" />
                    </button>
                    <button className="hover:text-foreground">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button className="hover:text-foreground">
                      <RotateCw className="h-4 w-4" />
                    </button>
                    <button className="hover:text-foreground">
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <span className="ml-1 text-xs">08:45 / 18:30</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="rounded border border-border px-1.5 text-[10px] font-bold tracking-wider hover:text-foreground">
                      CC
                    </button>
                    <button className="text-xs font-medium hover:text-foreground">1.25x</button>
                    <button className="hover:text-foreground">
                      <Settings className="h-4 w-4" />
                    </button>
                    <button className="hover:text-foreground">
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </MagicBentoCard>

              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-x-7 gap-y-2 border-b border-border">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`relative -mb-px py-3 text-sm transition-colors ${
                      activeTab === t
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                    {activeTab === t && (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Overview + Take notes */}
              <div className="grid items-stretch gap-5 md:grid-cols-2">
                <MagicBentoCard
                  className="flex h-full flex-col rounded-2xl border border-border bg-card p-5"
                  glowColor={glow}
                  enableStars={false}
                  enableMagnetism={false}
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-primary-soft">
                      <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-[var(--accent-violet)]">
                        <div className="h-2 w-2 rounded-full bg-[var(--accent-violet)]" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">React Basics</h3>
                        <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">
                          Current Lesson
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Module 1 · Introduction</p>
                      <p className="mt-2 text-sm text-foreground/80">
                        In this lesson, you'll learn the fundamentals of React, components, JSX, and
                        how everything fits together.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <PlayCircle className="h-3.5 w-3.5" /> 18:30
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3.5 w-3.5" /> Beginner
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" /> English
                        </span>
                      </div>
                    </div>
                  </div>
                </MagicBentoCard>

                <MagicBentoCard
                  className="flex h-full flex-col rounded-2xl border border-border bg-card p-5"
                  glowColor={glow}
                  enableStars={false}
                  enableMagnetism={false}
                >
                  <h3 className="text-sm font-semibold">Take Notes</h3>
                  <textarea
                    placeholder="Write your notes for this lesson..."
                    className="mt-3 h-24 w-full flex-1 resize-none rounded-lg border border-border bg-background/40 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
                        <List className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded p-1.5 hover:bg-foreground/[0.06] hover:text-foreground">
                        <ListOrdered className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button className="rounded-lg bg-[image:var(--gradient-primary)] px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-primary)] transition-transform hover:scale-[1.02]">
                      Save Note
                    </button>
                  </div>
                </MagicBentoCard>
              </div>

              {/* Action tiles */}
              <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ActionTile
                  icon={<FileText className="h-4 w-4 text-emerald-400" />}
                  title="Resources"
                  desc="Downloadable materials and useful links for this lesson."
                  cta="View Resources"
                />
                <ActionTile
                  icon={<ListChecks className="h-4 w-4 text-amber-400" />}
                  title="Practice Quiz"
                  desc="Test your understanding with a quick quiz."
                  cta="Start Quiz"
                  to="/playground/$slug"
                  params={{
                    slug: course.title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, ""),
                  }}
                />
                <ActionTile
                  icon={<ClipboardList className="h-4 w-4 text-sky-400" />}
                  title="Assignment"
                  desc="Apply what you learned in a hands-on assignment."
                  cta="View Assignment"
                />
                <ProgressTile />
              </div>

              {/* Bottom motivator */}
              <MagicBentoCard
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                glowColor={glow}
                enableStars={false}
                enableMagnetism={false}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/15">
                    <CheckCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Great job! Keep going 🚀
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Complete all lessons in this module to unlock the next one.
                    </div>
                  </div>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-4 py-2 text-xs font-medium text-foreground hover:bg-foreground/[0.04]">
                  <BarChart3 className="h-3.5 w-3.5" /> View Progress
                </button>
              </MagicBentoCard>
            </div>

            {/* SIDEBAR */}
            <aside className="flex flex-col gap-4">
              {/* Your Progress (moved from header) */}
              <MagicBentoCard
                className="rounded-2xl border border-border bg-card px-4 py-3"
                glowColor={glow}
                enableStars={false}
                enableMagnetism={false}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Your Progress</span>
                  <span className="text-xs font-semibold text-primary">48%</span>
                </div>
                <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[image:var(--gradient-primary)]"
                    style={{ width: "48%" }}
                  />
                </div>
              </MagicBentoCard>

              <MagicBentoCard
                className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-card p-5"
                glowColor={glow}
                enableStars={false}
                enableMagnetism={false}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Course Content</h3>
                  <button className="text-xs text-primary hover:underline">Collapse All</button>
                </div>

                <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-color:color-mix(in_srgb,var(--primary)_45%,transparent)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[color-mix(in_srgb,var(--primary)_45%,transparent)] [&::-webkit-scrollbar-thumb:hover]:bg-[color-mix(in_srgb,var(--primary)_70%,transparent)] [&::-webkit-scrollbar-track]:bg-transparent">
                  {modules.map((m, i) => (
                    <div key={m.title} className="rounded-lg border border-border bg-background/30">
                      <button
                        onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium">
                          {open[i] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          {m.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {m.done} / {m.total}
                        </span>
                      </button>
                      {open[i] && m.lessons.length > 0 && (
                        <ul className="border-t border-border px-2 py-2">
                          {m.lessons.map((l) => (
                            <li
                              key={l.n}
                              className={`flex items-center justify-between rounded-md px-2 py-2 text-xs ${
                                l.status === "current"
                                  ? "border border-primary/40 bg-primary-soft"
                                  : ""
                              }`}
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                {l.status === "done" && (
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                                )}
                                {l.status === "current" && (
                                  <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                                )}
                                {l.status === "locked" && (
                                  <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                )}
                                <span className="truncate text-foreground/85">
                                  {l.n}. {l.title}
                                </span>
                              </span>
                              <span className="ml-2 shrink-0 text-muted-foreground">
                                {l.duration}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </MagicBentoCard>

              <MagicBentoCard
                className="rounded-2xl border border-border bg-card p-5"
                glowColor={glow}
                enableStars={false}
                enableMagnetism={false}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Overall Course Progress</h3>
                  <span className="text-sm font-semibold text-primary">48%</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                    style={{ width: "48%" }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Stat value="12" label="Lessons" />
                  <Stat value="5h 42m" label="Time Spent" />
                  <Stat value="Certificate" label="Locked" icon={<Award className="h-3 w-3" />} />
                </div>
              </MagicBentoCard>
            </aside>
          </MagicBentoSection>
        </div>
      </main>
    </AppShell>
  );
}

function ActionTile({
  icon,
  title,
  desc,
  cta,
  to,
  params,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  to?: string;
  params?: Record<string, string>;
}) {
  const glow = useAccentRgb();
  const btnClass =
    "mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-soft px-3 py-2 text-xs font-medium text-primary hover:bg-primary/15";
  return (
    <MagicBentoCard
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-4"
      glowColor={glow}
      enableStars={false}
      enableMagnetism={false}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        {icon} {title}
      </div>
      <p className="mt-2 flex-1 text-xs text-muted-foreground">{desc}</p>
      {to ? (
        <Link
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          to={to as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          params={params as any}
          className={btnClass}
        >
          <Folder className="h-3.5 w-3.5" /> {cta}
        </Link>
      ) : (
        <button className={btnClass}>
          <Folder className="h-3.5 w-3.5" /> {cta}
        </button>
      )}
    </MagicBentoCard>
  );
}

function ProgressTile() {
  const glow = useAccentRgb();
  return (
    <MagicBentoCard
      className="flex h-full flex-col rounded-2xl border border-border bg-card p-4"
      glowColor={glow}
      enableStars={false}
      enableMagnetism={false}
    >
      <div className="text-sm font-semibold">Lesson Progress</div>
      <div className="mt-2 flex flex-1 items-center gap-3">
        <div
          className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full"
          style={{
            background:
              "conic-gradient(rgb(16 185 129) 0deg 270deg, color-mix(in oklab, var(--foreground) 10%, transparent) 270deg 360deg)",
          }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-card text-center">
            <span className="text-[11px] font-bold leading-none text-emerald-400">75%</span>
            <span className="text-[9px] leading-tight text-muted-foreground">Completed</span>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-xs">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />{" "}
            <span>3 Completed</span>
          </li>
          <li className="flex items-center gap-2">
            <PlayCircle className="h-3.5 w-3.5 shrink-0 text-primary" /> <span>1 In Progress</span>
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> <span>1 Locked</span>
          </li>
        </ul>
      </div>
    </MagicBentoCard>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/30 px-2 py-2">
      <div className="flex items-center justify-center gap-1 text-xs font-semibold text-foreground">
        {icon}
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
