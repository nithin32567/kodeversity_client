import { useState } from "react";
import {
  BookOpenCheck,
  Terminal,
  Briefcase,
  Wallet,
  Layers,
  LifeBuoy,
  Play,
  type LucideIcon,
} from "lucide-react";

type Audience = "individuals" | "business";

type Feature = {
  title: string;
  desc: string;
  icon: LucideIcon;
};

const featuresByAudience: Record<Audience, { left: Feature[]; right: Feature[] }> = {
  individuals: {
    left: [
      {
        title: "Guided Learning Paths",
        desc: "Expert-curated tracks for learners to navigate through strengths and weaknesses.",
        icon: BookOpenCheck,
      },
      {
        title: "Hands-on Lab Environments",
        desc: "Practical proficiency over theory — score real wins inside live terminals and clusters.",
        icon: Terminal,
      },
      {
        title: "Career-Focused Upskilling",
        desc: "Beginner to advanced courses, the guided learning path to upscale your career.",
        icon: Briefcase,
      },
    ],
    right: [
      {
        title: "Build Systems at No Cost",
        desc: "Our labs and sandboxes allow learners to build systems and architectures at zero cost.",
        icon: Wallet,
      },
      {
        title: "All-in-one Subscription",
        desc: "Get unlimited access to all our resources, all in one place, with one subscription.",
        icon: Layers,
      },
      {
        title: "Support & Assistance",
        desc: "Round-the-clock support to navigate your queries and provide guidance when stuck.",
        icon: LifeBuoy,
      },
    ],
  },
  business: {
    left: [
      {
        title: "Team Skill Mapping",
        desc: "Benchmark your engineering org and surface skill gaps across cloud, DevOps and AI.",
        icon: BookOpenCheck,
      },
      {
        title: "Private Lab Tenants",
        desc: "Spin up isolated lab tenants so teams can practice on production-grade infrastructure.",
        icon: Terminal,
      },
      {
        title: "Role-Based Tracks",
        desc: "Tracks aligned to SRE, Platform, Security and AI roles — measurable outcomes per role.",
        icon: Briefcase,
      },
    ],
    right: [
      {
        title: "Predictable Pricing",
        desc: "Per-seat plans with zero infra cost — scale teams without surprise cloud bills.",
        icon: Wallet,
      },
      {
        title: "Unified Admin Console",
        desc: "Provision seats, track progress, export reports — everything from a single console.",
        icon: Layers,
      },
      {
        title: "Dedicated Success Team",
        desc: "A named success engineer to design rollouts, content roadmaps and live workshops.",
        icon: LifeBuoy,
      },
    ],
  },
};

function FeatureBlock({ f, align }: { f: Feature; align: "left" | "right" }) {
  const Icon = f.icon;
  return (
    <div className={`flex gap-4 ${align === "right" ? "md:flex-row-reverse md:text-right" : ""}`}>
      <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-border/70 bg-gradient-to-br from-[var(--accent-cyan)]/10 to-[var(--accent-violet)]/10 text-[var(--accent-cyan)]">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col">
        <h3 className="font-display text-base font-semibold text-foreground md:text-[17px]">
          {f.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
      </div>
    </div>
  );
}

export function LearningSection() {
  const [audience, setAudience] = useState<Audience>("individuals");
  const data = featuresByAudience[audience];

  return (
    <section className="relative w-full overflow-hidden bg-background py-16 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Audience switcher */}
        <div className="flex justify-center">
          <div className="relative inline-flex rounded-full border border-border bg-card/60 p-1 backdrop-blur">
            {(["individuals", "business"] as Audience[]).map((opt) => {
              const active = audience === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setAudience(opt)}
                  className={`relative z-10 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors md:px-7 md:text-[13px] ${
                    active ? "text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] shadow-[0_0_24px_-6px_var(--accent-cyan)]"
                    />
                  )}
                  For {opt === "individuals" ? "Individuals" : "Business"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Headline */}
        <div className="mx-auto mt-10 max-w-4xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Learn{" "}
            <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] bg-clip-text text-transparent">
              Cloud the Right Way
            </span>
            : Confident, Practical, Real
          </h2>
        </div>

        {/* Features around a central visual */}
        <div className="mt-14 grid items-center gap-10 md:mt-20 md:grid-cols-12 md:gap-8">
          {/* Left features */}
          <div className="flex flex-col gap-10 md:col-span-4">
            {data.left.map((f) => (
              <FeatureBlock key={f.title} f={f} align="left" />
            ))}
          </div>

          {/* Center visual */}
          <div className="order-first md:order-none md:col-span-4">
            <div className="relative mx-auto aspect-square w-full max-w-sm">
              {/* glow ring */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at center, color-mix(in oklab, var(--accent-cyan) 18%, transparent), transparent 65%)",
                }}
              />
              <div className="absolute inset-6 rounded-full border border-border/60" />
              <div className="absolute inset-14 rounded-full border border-border/40" />

              {/* terminal card */}
              <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card/90 p-4 backdrop-blur-xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
                <div className="mb-3 flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-500/80" />
                  <span className="size-2.5 rounded-full bg-amber-400/80" />
                  <span className="size-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    lab · k8s-prod
                  </span>
                </div>
                <pre className="overflow-hidden font-mono text-[11px] leading-relaxed text-foreground/90">
                  {`$ kubectl apply -f deploy.yaml
deployment.apps/api created
service/api exposed
$ kubectl get pods
NAME            READY   STATUS
api-7c9-xk2     1/1     Running`}
                </pre>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] px-4 py-1.5 text-xs font-semibold text-background shadow-md transition hover:shadow-[0_0_24px_var(--accent-cyan)]"
                >
                  <Play className="size-3 fill-current" />
                  Start Hands-on Lab
                </button>
              </div>
            </div>
          </div>

          {/* Right features */}
          <div className="flex flex-col gap-10 md:col-span-4">
            {data.right.map((f) => (
              <FeatureBlock key={f.title} f={f} align="right" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
