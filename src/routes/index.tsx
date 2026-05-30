import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kodeversity — Hands-on DevOps, Cloud & AI Engineering" },
      {
        name: "description",
        content:
          "Learn DevOps, Cloud and AI engineering inside real clusters, pipelines and terminals. Hands-on labs, live sandboxes, no videos.",
      },
      { property: "og:title", content: "Kodeversity — Infrastructure you can navigate" },
      {
        property: "og:description",
        content:
          "Hands-on DevOps, Cloud and AI engineering. Real clusters, real pipelines, real terminals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=DM+Sans:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
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

        {/* LogoLoop Section between Courses and Challenges */}
        <section className="relative w-full border-y border-border/40 bg-background py-8 overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center gap-4">
              <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase font-mono">
                Empowered by Industry Standards
              </span>
              <div className="w-full relative h-[140px] flex items-center justify-center overflow-hidden">
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
