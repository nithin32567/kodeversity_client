import { useMouseField } from "@/presentation/lib/useMouseField";
import { useAccent } from "@/presentation/lib/useAccent";
import { HUDOverlay } from "./HUDOverlay";
import { DotGrid } from "./DotGrid";
import { AccentToggle } from "./AccentToggle";

export function Hero() {
  const mouse = useMouseField();
  const accent = useAccent();

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden bg-background font-mono">
      {}
      <div className="absolute inset-0 z-0">
        <DotGrid
          key={accent}
          dotSize={3}
          gap={26}
          baseColor="#1a1f2e"
          activeColor={accent}
          proximity={130}
          shockRadius={260}
          shockStrength={5}
        />
      </div>

      {}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(6,7,9,0.7) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[5] opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 3px)",
        }}
      />

      <HUDOverlay mouse={mouse} />
      <AccentToggle />
    </section>
  );
}
