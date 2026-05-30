import { ChevronRight } from "lucide-react";
import type { MenuItem } from "./menuData";
import { labsPopular, playgroundsPopular, playgroundsCategory } from "./menuData";

function Item({ item }: { item: MenuItem }) {
  const Icon = item.icon;
  return (
    <a
      href="#"
      className="group flex items-start gap-3 rounded-xl px-3 py-3 font-body transition-all hover:bg-foreground/[0.06] hover:ring-1 hover:ring-border/40"
    >
      <span
        className="grid size-11 shrink-0 place-items-center rounded-xl border border-border/50 bg-gradient-to-br from-foreground/[0.05] to-foreground/[0.01]"
        style={{ color: item.tint }}
      >
        <Icon className="size-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[14px] font-semibold tracking-normal text-foreground transition-colors group-hover:text-cyan">
          {item.label}
        </span>
        <span className="mt-1 text-[12px] font-normal normal-case tracking-normal text-muted-foreground">
          {item.sub}
        </span>
      </span>
    </a>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 mt-1 px-3 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
      {children}
      <div className="mt-1.5 h-[2px] w-8 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)]" />
    </div>
  );
}

function PillCta({ label }: { label: string }) {
  return (
    <a
      href="#"
      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] px-4 py-1.5 font-body text-xs font-semibold text-background ring-1 ring-inset ring-white/20 transition-all hover:shadow-[0_0_24px_var(--accent-cyan)]"
    >
      {label}
      <ChevronRight className="size-3.5" />
    </a>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text font-display text-xl font-semibold tracking-tight text-transparent">
      {children}
    </h3>
  );
}

export function PlaygroundsMenu() {
  return (
    <div
      className="w-[min(1180px,calc(100vw-3rem))] rounded-2xl border border-border bg-card/95 p-6 backdrop-blur-xl"
      style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6), 0 0 80px -30px var(--accent-cyan)" }}
    >
      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
        {/* soft vertical divider */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-4 left-1/2 hidden w-px -translate-x-1/2 lg:block"
          style={{
            background:
              "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--border) 80%, transparent), transparent)",
          }}
        />

        {/* Hands-on Labs */}
        <section className="lg:pr-6">
          <header className="mb-5 flex items-start justify-between gap-4 px-3">
            <div>
              <SectionTitle>Hands-on Labs</SectionTitle>
              <p className="mt-1.5 font-body text-[13px] text-muted-foreground">
                Enhance your practice with interactive hands-on labs
              </p>
            </div>
            <PillCta label="All Labs" />
          </header>
          <GroupLabel>Most Popular</GroupLabel>
          <div className="grid grid-cols-2 gap-1">
            {labsPopular.map((it) => (
              <Item key={it.label} item={it} />
            ))}
          </div>
        </section>

        {/* Sandbox Environments */}
        <section className="lg:pl-6">
          <header className="mb-5 flex items-start justify-between gap-4 px-3">
            <div>
              <SectionTitle>Sandbox Environments</SectionTitle>
              <p className="mt-1.5 font-body text-[13px] text-muted-foreground">
                Playgrounds offer no-cost, hands-on environments for real-world practice
              </p>
            </div>
            <PillCta label="All Playgrounds" />
          </header>
          <div className="grid grid-cols-2 gap-x-4">
            <div>
              <GroupLabel>Most Popular</GroupLabel>
              <div className="flex flex-col gap-1">
                {playgroundsPopular.map((it) => (
                  <Item key={it.label} item={it} />
                ))}
              </div>
            </div>
            <div>
              <GroupLabel>By Category</GroupLabel>
              <div className="flex flex-col gap-1">
                {playgroundsCategory.map((it) => (
                  <Item key={it.label} item={it} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
