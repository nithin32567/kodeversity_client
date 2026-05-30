import { createFileRoute } from "@tanstack/react-router";
import { Play, BookOpen, Clock, ExternalLink } from "lucide-react";
import { AppShell } from "@/presentation/components/student/AppShell";

export const Route = createFileRoute("/_student/challenges")({
  head: () => ({
    meta: [
      { title: "Challenges — Kodeversity" },
      {
        name: "description",
        content: "Hands-on labs and challenges to master containerization, DevOps, and cloud.",
      },
    ],
  }),
  component: ChallengesPage,
});

type Level = "Beginner" | "Intermediate" | "Advanced";

interface Lab {
  title: string;
  duration: string;
  level: Level;
  description: string;
  tags: string[];
  extra: number;
}

const labs: Lab[] = [
  {
    title: "Docker Basic Commands",
    duration: "1 hour",
    level: "Beginner",
    description: "Learn essential Docker commands for container management and operations.",
    tags: ["Docker CLI", "Containers"],
    extra: 1,
  },
  {
    title: "Docker Run",
    duration: "1.5 hours",
    level: "Beginner",
    description: "Master the docker run command with various options and configurations.",
    tags: ["Docker Run", "Container Configuration"],
    extra: 1,
  },
  {
    title: "Docker Environment Variables",
    duration: "1 hour",
    level: "Beginner",
    description: "Learn how to use environment variables in Docker containers.",
    tags: ["Environment Variables", "Docker"],
    extra: 1,
  },
  {
    title: "Docker Images",
    duration: "2 hours",
    level: "Intermediate",
    description: "Understand Docker images, building custom images, and image management.",
    tags: ["Docker Images", "Dockerfile"],
    extra: 1,
  },
  {
    title: "Docker CMD & Entrypoint",
    duration: "1.5 hours",
    level: "Intermediate",
    description: "Learn the difference between CMD and ENTRYPOINT in Dockerfiles.",
    tags: ["CMD", "ENTRYPOINT"],
    extra: 1,
  },
  {
    title: "Docker Compose",
    duration: "2.5 hours",
    level: "Intermediate",
    description: "Learn Docker Compose for multi-container application orchestration.",
    tags: ["Docker Compose", "Multi-container"],
    extra: 1,
  },
  {
    title: "Docker Networking",
    duration: "2 hours",
    level: "Advanced",
    description: "Explore Docker networking modes, bridges, and custom networks.",
    tags: ["Networking", "Bridge"],
    extra: 1,
  },
  {
    title: "Docker Storage & Volumes",
    duration: "1.5 hours",
    level: "Advanced",
    description: "Manage persistent data with volumes, bind mounts, and tmpfs.",
    tags: ["Volumes", "Storage"],
    extra: 1,
  },
  {
    title: "Docker Security",
    duration: "2 hours",
    level: "Advanced",
    description: "Harden containers with best practices, user namespaces, and image scanning.",
    tags: ["Security", "Best Practices"],
    extra: 1,
  },
];

const levelClasses: Record<Level, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
  Intermediate: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
  Advanced: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30",
};

function ChallengesPage() {
  return (
    <AppShell activeTop="Courses" variant="learn">
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-[1600px] px-6 py-8">
          <header className="mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Docker Challenges
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              Learn containerization with Docker. Master basic commands, images, networking,
              storage, and Docker Compose for multi-container applications.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
                <BookOpen className="h-3.5 w-3.5" /> 9 Labs
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
                <Clock className="h-3.5 w-3.5" /> 6–10 hours
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-rose-300 ring-1 ring-rose-400/30">
                beginner
              </span>
            </div>
          </header>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {labs.map((lab) => (
              <article
                key={lab.title}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_-10px_var(--primary)]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <button
                    aria-label={`Start ${lab.title}`}
                    className="grid h-10 w-10 place-items-center rounded-lg bg-background/60 ring-1 ring-border transition group-hover:bg-[image:var(--gradient-primary)] group-hover:ring-transparent"
                  >
                    <Play className="h-4 w-4 translate-x-0.5 fill-current text-foreground" />
                  </button>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${levelClasses[lab.level]}`}
                  >
                    {lab.level}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-semibold text-foreground">{lab.title}</h3>
                  <span className="text-xs text-muted-foreground">{lab.duration}</span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {lab.description}
                </p>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {lab.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" /> Interactive
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {lab.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-border bg-background/40 px-2 py-1 text-[11px] font-medium text-foreground/80"
                    >
                      #{t}
                    </span>
                  ))}
                  {lab.extra > 0 && (
                    <span className="rounded-md border border-border bg-background/40 px-2 py-1 text-[11px] font-medium text-muted-foreground">
                      +{lab.extra}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
