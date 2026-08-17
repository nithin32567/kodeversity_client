import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  PlayCircle,
  Rocket,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Users,
  ClipboardList,
  MonitorPlay,
} from "lucide-react";

import logo from "@/assets/image.png";
import heroStudent from "@/assets/hero-student.jpg";

const navLinks = ["Home", "Courses", "Features", "About", "Contact"];

const floatingCards = [
  {
    icon: MonitorPlay,
    title: "Video Lessons",
    sub: "Learn at your pace",
    tint: "text-brand",
    position: "left-2 top-[4%]",
  },
  {
    icon: Users,
    title: "Expert Support",
    sub: "Get help anytime",
    tint: "text-chart-4",
    position: "right-2 top-[16%]",
  },
  {
    icon: ClipboardList,
    title: "Practice Quizzes",
    sub: "Test and improve",
    tint: "text-chart-1",
    position: "left-2 top-[34%]",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    sub: "Monitor your growth",
    tint: "text-chart-2",
    position: "right-2 top-[52%]",
  },
];

const features = [
  { icon: BookOpen, title: "Quality Courses", copy: "Curated courses by industry experts." },
  { icon: GraduationCap, title: "Learn Anytime", copy: "Study at your own pace, anytime, anywhere." },
  { icon: BarChart3, title: "Track Progress", copy: "Monitor your learning and achieve more." },
  { icon: ShieldCheck, title: "Trusted Platform", copy: "Secure, reliable and built for students." },
];

export function StudyLaahlanding() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-background font-display text-foreground"
      style={{ backgroundImage: "var(--gradient-hero)" }}
    >
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <img src={logo} alt="Study Lah!" className="h-12 w-auto" />

        <nav className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link, i) => (
            <a
              key={link}
              href="#"
              className={
                i === 0
                  ? "border-b-2 border-brand pb-1 text-sm font-semibold text-brand"
                  : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {link}
            </a>
          ))}
        </nav>

        <button
          onClick={() => navigate('/login')}
          className="rounded-lg bg-brand px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          style={{ boxShadow: "var(--shadow-brand)" }}
        >
          Sign In
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20">
        <section className="grid items-center gap-16 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium">
              <GraduationCap className="h-4 w-4 text-brand" />
              Learn Smarter. Achieve More.
            </span>

            <h1 className="mt-8 text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
              Your Learning
              <br />
              Journey <span className="text-brand">Starts Here!</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Study Lah! helps you access quality courses, expert guidance, and the right resources
              to achieve your goals.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <button
                className="inline-flex items-center gap-3 rounded-xl bg-brand px-8 py-4 font-bold text-primary-foreground transition-opacity hover:opacity-90"
                style={{ boxShadow: "var(--shadow-brand)" }}
              >
                <Rocket className="h-5 w-5" />
                Explore Courses
              </button>
              <button className="inline-flex items-center gap-3 rounded-xl border border-border px-8 py-4 font-semibold transition-colors hover:bg-accent">
                <PlayCircle className="h-5 w-5" />
                Watch Demo
              </button>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {["A", "M", "R"].map((initial) => (
                  <span
                    key={initial}
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-secondary text-sm font-bold text-muted-foreground"
                  >
                    {initial}
                  </span>
                ))}
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-brand text-xs font-bold text-primary-foreground">
                  2K+
                </span>
              </div>
              <div className="text-sm">
                <p className="font-semibold">Join 2,000+ students</p>
                <p className="text-muted-foreground">and start learning today!</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroStudent}
              alt="Student learning online with Study Lah!"
              width={1200}
              height={1008}
              className="w-full rounded-3xl"
              style={{ maskImage: "radial-gradient(80% 80% at 50% 50%, black 65%, transparent)" }}
            />

            {floatingCards.map((card) => (
              <div
                key={card.title}
                className={`absolute hidden items-center gap-3 rounded-xl border border-border bg-card/90 px-4 py-3 backdrop-blur sm:flex ${card.position}`}
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <card.icon className={`h-5 w-5 ${card.tint}`} />
                </span>
                <span>
                  <span className="block text-sm font-bold leading-tight">{card.title}</span>
                  <span className="block text-xs text-muted-foreground">{card.sub}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl border border-border bg-card/50 p-8 sm:grid-cols-2 lg:grid-cols-4 lg:p-10">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <f.icon className="h-6 w-6 text-brand" />
              </span>
              <div>
                <h2 className="font-bold">{f.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.copy}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
          <img src={logo} alt="Study Lah!" className="h-6 w-auto" />
          <p>© {new Date().getFullYear()} Study Lah! All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
