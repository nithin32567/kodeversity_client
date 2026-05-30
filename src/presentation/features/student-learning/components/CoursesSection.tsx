import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { tabs } from "./data";
import { ScrollFloat } from "@/presentation/features/student-learning/components/animations/ScrollFloat";
import { CourseCard } from "./CourseCard";
import { ViewAllCard } from "./ViewAllCard";
import DarkVeil from "@/presentation/global/DarkVeil";

export function CoursesSection() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("top");
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full bg-background py-16 md:py-24 overflow-hidden">
      {/* subtle top fade */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "radial-gradient(ellipse at top, color-mix(in oklab, var(--accent-violet) 15%, transparent), transparent 70%)",
        }}
      />

      {/* DarkVeil Background covering the entire course section */}
      {mounted && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-30 mix-blend-screen">
          <DarkVeil
            hueShift={0}
            noiseIntensity={0}
            scanlineIntensity={0}
            speed={0.5}
            scanlineFrequency={0}
            warpAmount={0}
            resolutionScale={1}
          />
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollFloat
            containerClassName="text-balance text-3xl md:text-5xl text-foreground"
            textClassName="font-bold tracking-tight"
          >
            Up-Skill, Get Certified, and Advance Your Tech Career
          </ScrollFloat>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Discover expert-led IT courses, guided learning paths, and career development tracks
            built to fast-track your success.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to="/courses"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-violet)] px-8 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.02] hover:shadow-[0_0_40px_-5px_var(--accent-cyan)]"
            >
              Explore Courses
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 border-b border-border md:mt-16">
          <div className="-mx-4 flex items-center gap-4 overflow-x-auto px-4 md:mx-0 md:justify-center md:gap-8 md:overflow-visible md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`relative shrink-0 whitespace-nowrap px-1 pb-3 text-sm font-medium transition-colors md:text-base ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--accent-cyan)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {current.data.map((c) => (
            <CourseCard key={c.title} course={c} />
          ))}
          <ViewAllCard />
        </div>
      </div>
    </section>
  );
}
