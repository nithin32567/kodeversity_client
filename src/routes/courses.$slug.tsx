import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import { findCourseBySlug } from "@/presentation/components/courses/data";
import { MagicBentoCard, MagicBentoSection } from "@/presentation/components/ui/MagicBento";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { AppShell } from "@/presentation/components/AppShell";

export const Route = createFileRoute("/courses/$slug")({
  loader: ({ params }) => {
    const course = findCourseBySlug(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.course.title ?? "Course"} — Kodeversity` },
      {
        name: "description",
        content: loaderData?.course.description ?? "Course details on Kodeversity.",
      },
    ],
  }),
  component: CourseDetailPage,
});

const tabs = ["Overview", "Curriculum", "Projects", "Instructor", "Reviews (2.1K)", "FAQs"];

const learnItems = [
  "Build modern React applications",
  "Fetch & integrate APIs",
  "Understand components, props & state",
  "Form handling & validation",
  "Work with React Hooks",
  "Authentication in React apps",
  "Implement React Router",
  "Deploy React apps",
  "Manage global state with Context API",
  "Build 5 real-world projects",
];

const sidebarFeatures = [
  { icon: ShieldCheck, label: "30 Days Money-back Guarantee" },
  { icon: InfinityIcon, label: "Lifetime Access" },
  { icon: Smartphone, label: "Access on Mobile and TV" },
  { icon: Award, label: "Certificate of Completion" },
  { icon: Download, label: "Downloadable Resources" },
  { icon: MessageCircle, label: "24/7 Community Support" },
];

const includes = [
  { icon: Video, label: "32 Hours on-demand video" },
  { icon: BookOpen, label: "120 Lessons" },
  { icon: Layers, label: "5 Real-world projects" },
  { icon: Download, label: "Downloadable resources" },
  { icon: InfinityIcon, label: "Full lifetime access" },
  { icon: Smartphone, label: "Access on mobile and TV" },
  { icon: Award, label: "Certificate of completion" },
];

const ratingBreakdown = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 18 },
  { stars: 3, pct: 3 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
];

const companies = ["Google", "Microsoft", "amazon", "Flipkart", "Apple", "intel", "TCS"];

function CourseDetailPage() {
  const { course } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const glow = useAccentRgb();

  const price = 2499;
  const originalPrice = 4999;

  return (
    <AppShell activeTop="Courses">
      <main className="relative min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <Link to="/" className="hover:text-foreground">
              Courses
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="hover:text-foreground">Web Development</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{course.title}</span>
          </nav>

          <MagicBentoSection
            className="grid gap-6 lg:grid-cols-[1fr_360px]"
            glowColor={glow}
            spotlightRadius={400}
          >
            {/* MAIN COLUMN */}
            <div className="flex flex-col gap-6">
              {/* Top row: title block + video */}
              <div className="grid gap-6 md:grid-cols-2">
                <section className="flex flex-col">
                  <span className="mb-4 inline-flex w-fit items-center rounded-md bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold tracking-wider text-emerald-400">
                    BESTSELLER
                  </span>
                  <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-[2rem]">
                    {course.title}
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary/40 to-primary/10 text-xs font-semibold text-foreground ring-2 ring-border">
                      {course.instructor
                        .split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-semibold">{course.instructor}</div>
                      <div className="text-xs text-muted-foreground">
                        Senior Frontend Developer at Microsoft
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5 text-amber-400">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? "fill-current" : ""}`} />
                        ))}
                      </div>
                      <span className="text-xs font-medium">4.8 (2.1K Ratings)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      12.5K Students
                    </div>
                  </div>
                </section>

                {/* Video card */}
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
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-muted-foreground">
                    <Play className="h-3 w-3 fill-current" />
                    <span>Preview this course</span>
                  </div>
                </MagicBentoCard>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <StatBox
                  icon={<BarChart3 className="h-4 w-4" />}
                  value="Beginner to Advanced"
                  label="Level"
                />
                <StatBox icon={<Clock className="h-4 w-4" />} value="32 Hours" label="Duration" />
                <StatBox
                  icon={<BookOpen className="h-4 w-4" />}
                  value="120 Lessons"
                  label="Content"
                />
                <StatBox
                  icon={<Layers className="h-4 w-4" />}
                  value="5 Real-world Projects"
                  label="Hands-on"
                />
                <StatBox
                  icon={<Award className="h-4 w-4" />}
                  value="Certificate"
                  label="Included"
                />
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-x-7 gap-y-2 border-b border-border">
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

              {/* Big content card */}
              <MagicBentoCard
                className="rounded-2xl border border-border bg-card p-6 md:p-7"
                glowColor={glow}
                enableStars={false}
                enableMagnetism={false}
              >
                <h2 className="font-display text-lg font-semibold">What you'll learn</h2>
                <ul className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                  {learnItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-emerald-500/15 p-0.5 text-emerald-400" />
                      <span className="text-foreground/85">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="my-7 h-px bg-border" />

                <h2 className="font-display text-lg font-semibold">Course Description</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    This comprehensive course will take you from zero to hero in React. You will
                    learn everything from the basics to advanced concepts by building real-world
                    projects that you can add to your portfolio and showcase your skills to
                    potential employers.
                  </p>
                  <p>
                    By the end of this course, you will be able to build any React application with
                    confidence.
                  </p>
                </div>
                <button className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Show more <ChevronDown className="h-4 w-4" />
                </button>

                <div className="my-7 h-px bg-border" />

                <h3 className="text-sm font-semibold text-foreground/90">
                  Top companies our learners work at
                </h3>
                <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 text-muted-foreground">
                  {companies.map((c) => (
                    <span key={c} className="text-base font-semibold tracking-tight opacity-80">
                      {c}
                    </span>
                  ))}
                  <MoreHorizontal className="h-5 w-5" />
                </div>
              </MagicBentoCard>

              {/* Reviews card */}
              <MagicBentoCard
                className="rounded-2xl border border-border bg-card p-6 md:p-7"
                glowColor={glow}
                enableStars={false}
                enableMagnetism={false}
              >
                <h2 className="font-display text-lg font-semibold">Reviews (2.1K)</h2>
                <div className="mt-5 grid gap-6 md:grid-cols-[260px_1fr]">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-5xl font-bold">4.8</span>
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
                    <button className="mt-5 rounded-lg border border-primary/60 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary-soft">
                      Write a review
                    </button>
                  </div>

                  <div className="space-y-4">
                    <ReviewItem />
                  </div>
                </div>
              </MagicBentoCard>
            </div>

            {/* SIDEBAR */}
            <aside className="flex flex-col gap-5">
              <MagicBentoCard
                className="rounded-2xl border border-border bg-card p-5"
                glowColor={glow}
                enableStars={false}
                enableMagnetism={false}
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold">
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-bold text-emerald-400">50% OFF</span>
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

                <div className="mt-5 border-t border-border pt-4">
                  <div className="mb-3 text-sm font-semibold">This course includes:</div>
                  <ul className="space-y-2.5">
                    {includes.map(({ icon: Icon, label }) => (
                      <li
                        key={label}
                        className="flex items-center gap-2.5 text-sm text-foreground/80"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
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
    </AppShell>
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

function ReviewItem() {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-xs font-semibold text-primary-foreground ring-2 ring-border">
          RS
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Rohit Sharma</div>
              <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-emerald-400">
                <Check className="h-3 w-3" /> Verified Buyer
              </div>
            </div>
            <span className="text-xs text-muted-foreground">5 months ago</span>
          </div>
          <div className="mt-2 flex gap-0.5 text-amber-400">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <p className="mt-2 text-sm text-foreground/85">
            Amazing course! The way of teaching and project explanations are top-notch. Helped me
            build confidence in React.
          </p>
          <button className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ThumbsUp className="h-3.5 w-3.5" /> Helpful (120)
          </button>
        </div>
      </div>
    </div>
  );
}
