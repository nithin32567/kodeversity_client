/**
 * LandingPage
 * Migrated from: src/routes/index.tsx
 * TanStack-specific: createFileRoute, head() → removed
 * Navigation: unchanged (uses href links, no router-specific API)
 */
import { Hero } from "@/presentation/features/student-learning/components/hero/Hero";
import { SplashCursor } from "@/presentation/global/SplashCursor";
import { CoursesSection } from "@/presentation/features/student-learning/components/CoursesSection";
import { ChallengesSection } from "@/presentation/features/playground/components/ChallengesSection";
import { LearningSection } from "@/presentation/features/student-learning/components/LearningSection";
import LogoLoop from "@/presentation/global/LogoLoop";
import { RevealFooter } from "@/presentation/features/student-learning/components/RevealFooter";
import { useAccent } from "@/presentation/lib/useAccent";
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from "react-icons/si";

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
];

export function LandingPage() {
  const accent = useAccent();
  return (
    <>
      <SplashCursor
        key={accent}
        SIM_RESOLUTION={128}
        DYE_RESOLUTION={1440}
        DENSITY_DISSIPATION={3.5}
        VELOCITY_DISSIPATION={2}
        PRESSURE={0.1}
        CURL={3}
        SPLAT_RADIUS={0.2}
        SPLAT_FORCE={6000}
        COLOR_UPDATE_SPEED={10}
        RAINBOW_MODE={false}
        COLOR={accent}
      />
      <div id="main-content" className="relative z-10 bg-background">
        <Hero />
        <CoursesSection />

        <section className="relative w-full overflow-hidden border-y border-border/40 bg-background py-8">
          <div className="relative mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center gap-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Empowered by Industry Standards
              </span>
              <div className="relative flex h-[140px] w-full items-center justify-center overflow-hidden">
                <LogoLoop
                  logos={techLogos}
                  speed={80}
                  direction="left"
                  logoHeight={80}
                  gap={160}
                  hoverSpeed={0}
                  scaleOnHover
                  fadeOut
                  fadeOutColor="var(--background)"
                  ariaLabel="Technology partners"
                />
              </div>
            </div>
          </div>
        </section>

        <ChallengesSection />
        <LearningSection />
      </div>

      <RevealFooter />
    </>
  );
}
