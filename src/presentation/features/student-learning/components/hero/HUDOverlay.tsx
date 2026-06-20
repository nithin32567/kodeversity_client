import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { MouseField } from "@/presentation/lib/useMouseField";
import { PlaygroundsMenu } from "./nav/PlaygroundsMenu";
import { TextType } from "@/presentation/features/student-learning/components/animations/TextType";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";

type Props = { mouse: React.MutableRefObject<MouseField> };

export function HUDOverlay({ mouse }: Props) {
  const [coords, setCoords] = useState({ x: "0.00", y: "0.00", lat: "12.4" });

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last >= 120) {
        last = now;
        const m = mouse.current;
        setCoords({
          x: m.x.toFixed(2),
          y: m.y.toFixed(2),
          lat: (12 + Math.abs(m.x) * 8 + Math.abs(m.y) * 4).toFixed(1),
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mouse]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      {}
      <header className="flex items-start justify-between p-4 md:p-10 text-[11px] uppercase tracking-[0.2em] text-foreground/80">
        <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
          <span className="inline-block size-2 rounded-full bg-cyan shadow-[0_0_12px_var(--accent-cyan)]" />
          <span className="font-semibold">KODEVERSITY</span>
          <span className="hidden text-muted-foreground sm:inline">cluster.us-east-1</span>
        </div>
        <nav className="pointer-events-auto hidden gap-6 md:flex">
          <a href="#tracks" className="hover:text-cyan transition-colors">
            Tracks
          </a>
          <PlaygroundsNavItem />
          <a href="#pricing" className="hover:text-cyan transition-colors">
            Pricing
          </a>
          <AuthNavLink />
        </nav>
        <div className="hidden items-center gap-4 text-right text-muted-foreground md:flex">
          <div>
            <div>
              LAT <span className="text-cyan">{coords.lat}ms</span>
            </div>
            <div>
              NODES <span className="text-cyan">2400</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <MobileMenu />
      </header>

      {}
      <main className="flex flex-1 items-center justify-center px-4 text-center md:px-6">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/5 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-cyan md:mb-6 md:text-[10px]">
            <span className="size-1.5 rounded-full bg-cyan animate-pulse" />
            v2.0 — live sandbox environments
          </div>
          <h1 className="font-mono text-3xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-4xl md:text-6xl lg:text-7xl">
            Infrastructure
            <br />
            you can{" "}
            <TextType
              text={["navigate.", "deploy.", "scale.", "master."]}
              className="text-cyan drop-shadow-[0_0_24px_var(--accent-cyan)]"
              cursorClassName="text-cyan ml-1"
              typingSpeed={45}
              deletingSpeed={20}
              pauseDuration={900}
            />
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm md:mt-6 md:text-base">
            Hands-on DevOps, Cloud and AI engineering — taught inside real clusters, real pipelines,
            real terminals with videos sessions.
          </p>
          <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3 md:mt-10">
            <a
              href="#enter"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-all hover:scale-[1.02] hover:shadow-[0_0_32px_var(--accent-cyan)] md:px-6 md:text-xs"
            >
              <span>Enter the cluster</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#tracks"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.02] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/90 transition-colors hover:border-cyan/40 hover:text-cyan md:px-6 md:text-xs"
            >
              View tracks
            </a>
          </div>
        </div>
      </main>

      {}
      <footer className="grid grid-cols-2 gap-3 p-4 text-[9px] uppercase tracking-[0.18em] text-muted-foreground md:grid-cols-4 md:gap-4 md:p-10 md:text-[10px] md:tracking-[0.2em]">
        <div>
          <div className="text-foreground/40">PTR</div>
          <div className="font-mono text-cyan">
            x:{coords.x} y:{coords.y}
          </div>
        </div>
        <div>
          <div className="text-foreground/40">PIPE</div>
          <div className="font-mono">
            ci/cd · <span className="text-[oklch(0.55_0.28_295)]">violet</span>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="text-foreground/40">REGION</div>
          <div className="font-mono">us-east-1 · eu-west-2 · ap-south-1</div>
        </div>
        <div className="hidden md:block text-right md:text-left">
          <div className="text-foreground/40">SCROLL</div>
          <div className="font-mono text-foreground/80">↓ continue</div>
        </div>
      </footer>
    </div>
  );
}

function AuthNavLink() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    void navigate({ to: isAuthenticated ? "/dashboard" : "/login" });
  };

  return (
    <button onClick={handleClick} className="hover:text-cyan transition-colors cursor-pointer">
      {isAuthenticated ? "Dashboard" : "Login"}
    </button>
  );
}

import { ACCENT_COLORS, setAccent, useAccent } from "@/presentation/lib/useAccent";

function ThemeToggle() {
  const [open, setOpen] = useState(false);
  const color = useAccent();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="pointer-events-auto relative">
      <button
        aria-label="Theme color"
        onClick={() => setOpen((v) => !v)}
        className="group relative grid size-10 place-items-center rounded-full border border-border/60 bg-card/60 backdrop-blur-md transition-all hover:scale-105 hover:border-foreground/40"
        style={{ boxShadow: `0 0 20px ${color}55, inset 0 0 0 1px ${color}30` }}
      >
        <span
          className="size-4 rounded-full transition-transform group-hover:rotate-90"
          style={{
            background: `conic-gradient(from 180deg, ${color}, ${color}aa, ${color})`,
            boxShadow: `0 0 12px ${color}, inset 0 0 0 1px rgba(255,255,255,0.25)`,
          }}
        />
      </button>
      <div
        className={`absolute right-0 top-12 z-50 origin-top-right transition-all duration-200 ${
          open
            ? "scale-100 opacity-100 translate-y-0"
            : "pointer-events-none scale-95 opacity-0 -translate-y-1"
        }`}
      >
        <div
          className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card/95 p-3 backdrop-blur-xl"
          style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)" }}
        >
          <div className="px-1 pb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Accent
          </div>
          {ACCENT_COLORS.map((c) => {
            const active = color.toLowerCase() === c.value.toLowerCase();
            return (
              <button
                key={c.value}
                aria-label={c.name}
                onClick={() => {
                  setAccent(c.value);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all hover:bg-foreground/[0.05] ${
                  active ? "border-foreground/30" : "border-transparent"
                }`}
              >
                <span
                  className="size-5 shrink-0 rounded-full"
                  style={{
                    background: c.value,
                    boxShadow: `0 0 14px ${c.value}aa, inset 0 0 0 1px rgba(255,255,255,0.25)`,
                  }}
                />
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/90">
                  {c.name}
                </span>
                {active && <span className="ml-auto size-1.5 rounded-full bg-foreground/80" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlaygroundsNavItem() {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 180);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <a href="#playgrounds" onFocus={show} className="hover:text-cyan transition-colors">
        Playgrounds
      </a>
      <div
        className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4 transition-all duration-150 ${
          open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-1"
        }`}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <PlaygroundsMenu />
      </div>
    </div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    setOpen(false);
    void navigate({ to: isAuthenticated ? "/dashboard" : "/login" });
  };

  return (
    <div className="pointer-events-auto md:hidden">
      <button
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
        className="grid size-9 place-items-center rounded-full border border-border/60 bg-card/60 text-foreground transition-colors hover:border-cyan/50 hover:text-cyan"
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>
      {open && (
        <div className="absolute right-4 top-14 z-50 flex w-56 flex-col gap-1 rounded-2xl border border-border bg-card/95 p-3 text-xs uppercase tracking-[0.2em] text-foreground/90 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]">
          {[
            { href: "#tracks", label: "Tracks" },
            { href: "#playgrounds", label: "Playgrounds" },
            { href: "#pricing", label: "Pricing" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-full px-4 py-2 transition-colors hover:bg-foreground/[0.06] hover:text-cyan"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={handleLoginClick}
            className="rounded-full px-4 py-2 text-left transition-colors hover:bg-foreground/[0.06] hover:text-cyan"
          >
            {isAuthenticated ? "Dashboard" : "Login"}
          </button>
        </div>
      )}
    </div>
  );
}
