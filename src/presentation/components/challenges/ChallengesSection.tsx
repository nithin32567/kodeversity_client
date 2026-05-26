import { Cloud, Cpu, GitBranch, ArrowRight, Play, Trophy, Users } from "lucide-react";

type Challenge = {
  title: string;
  icon: React.ReactNode;
  duration: string;
  participants: string;
  description: string;
  badge: string;
  type: string;
};

const challenges: Challenge[] = [
  {
    title: "90 Days of DevOps",
    icon: <GitBranch className="h-4 w-4" />,
    duration: "90 Days",
    participants: "12.4k",
    description:
      "Commit to one hands-on DevOps task every day. Build production-grade infrastructure, automate pipelines with CI/CD, and manage Kubernetes in real-world scenarios.",
    badge: "Free Challenge",
    type: "DevOps Track",
  },
  {
    title: "90 Days of Cloud",
    icon: <Cloud className="h-4 w-4" />,
    duration: "90 Days",
    participants: "8.9k",
    description:
      "Design and deploy scalable, secure, and resilient multi-cloud architectures. Build real networks, virtual clusters, serverless applications, and cloud-native solutions.",
    badge: "Free Challenge",
    type: "Cloud Track",
  },
  {
    title: "90 Days of Hacking",
    icon: <Cpu className="h-4 w-4" />,
    duration: "90 Days",
    participants: "5.2k",
    description:
      "Bridge the gap between security theory and live exploitation. Execute real-world penetration tests, discover critical system vulnerabilities, and compromise target systems in secure sandbox environments.",
    badge: "Free Challenge",
    type: "Ethical Hacking Track",
  },
];

export function ChallengesSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-16 md:py-24">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            90 Days of Real Engineering Labs
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            Why limit your potential to just one tech domain?
          </p>
          <p className="mt-4 text-base font-medium text-foreground/90 md:text-lg">
            Switch when the sprint ends.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-8">
          {challenges.map((c) => (
            <article
              key={c.title}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)]"
            >
              {c.badge && (
                <span className="absolute -top-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] px-3 py-1 text-xs font-semibold text-background shadow-md">
                  <span className="inline-block h-2 w-2 rounded-full bg-background animate-pulse" />
                  {c.badge}
                </span>
              )}

              <div className="mb-3 flex items-start justify-between gap-4">
                <h3 className="text-left text-lg font-bold leading-tight text-foreground group-hover:text-[var(--accent-cyan)] transition-colors">
                  {c.title}
                </h3>
                <button
                  aria-label={`Start ${c.title}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-all hover:bg-gradient-to-r hover:from-[var(--accent-cyan)] hover:to-[var(--accent-violet)] hover:text-background hover:scale-105"
                >
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </button>
              </div>

              <div className="mb-4 flex items-center gap-5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
                  <span>{c.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
                  <span>{c.participants} Joined</span>
                </div>
              </div>

              {/* Photo/Illustration Placeholder */}
              <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-[var(--accent-cyan)]/5 to-[var(--accent-violet)]/5 transition-all duration-300 group-hover:border-[var(--accent-cyan)]/30 group-hover:from-[var(--accent-cyan)]/10 group-hover:to-[var(--accent-violet)]/10">
                {/* Micro-tech dot grid pattern background */}
                <div
                  className="absolute inset-0 opacity-20 mix-blend-overlay"
                  style={{
                    backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
                    backgroundSize: "12px 12px",
                  }}
                />

                {/* Glow/Light effect in center */}
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-cyan)]/10 blur-xl transition-all duration-500 group-hover:bg-[var(--accent-cyan)]/25 group-hover:scale-125" />

                {/* Glassmorphic floating challenge badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-background/40 p-4 backdrop-blur-md transition-all duration-300 group-hover:border-white/20 group-hover:bg-background/60 group-hover:scale-105">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-violet)]/20 text-[var(--accent-cyan)] group-hover:text-[var(--accent-violet)] transition-colors duration-300">
                      {c.icon}
                    </div>
                    <div className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase font-mono">
                      DAY 1 &rarr; DAY 90
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-violet)] text-[10px] text-background">
                    {c.icon}
                  </div>
                  <span className="text-xs text-foreground font-semibold uppercase tracking-wider font-mono">
                    {c.type}
                  </span>
                </div>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-cyan)] transition-all hover:translate-x-0.5 hover:underline"
                >
                  Start Challenge <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
