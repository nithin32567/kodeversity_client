import React, { useRef, useEffect, useState } from "react";

export interface ScrollVelocityProps {
  texts: string[];
  velocity?: number; // base speed
  className?: string;
  numCopies?: number;
  damping?: number;
  stiffness?: number;
}

export default function ScrollVelocity({
  texts,
  velocity = 100,
  className = "",
  numCopies = 6,
  damping = 50,
  stiffness = 400,
}: ScrollVelocityProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track position and scrolling speed
  const lastScrollY = useRef(0);
  const scrollVelocity = useRef(0);
  const currentVelocity = useRef(0);
  const position = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Track scroll positions to calculate scroll delta (velocity)
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY.current;
      lastScrollY.current = currentScrollY;

      // Update scroll velocity (capped to prevent extreme jumps)
      scrollVelocity.current = Math.min(Math.max(deltaY * 0.1, -15), 15);

      // Clear any existing scroll timeout
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

      // Decay velocity back to 0 when scrolling stops
      scrollTimeout.current = setTimeout(() => {
        scrollVelocity.current = 0;
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  // Animation Loop using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const updatePosition = () => {
      // Calculate spring-damper LERP factor based on stiffness/damping props
      // Standard: current = current + (target - current) * factor
      const springFactor = Math.min(Math.max((stiffness / damping) * 0.01, 0.01), 0.5);

      // Interpolate current velocity toward the target scroll velocity
      currentVelocity.current += (scrollVelocity.current - currentVelocity.current) * springFactor;

      // Base translation speed (derived from the velocity prop)
      const baseSpeed = (velocity / 100) * 0.5;

      // Combined velocity = base continuous speed + dynamic scroll velocity
      const netSpeed = baseSpeed + currentVelocity.current;

      // Update horizontal position
      position.current -= netSpeed;

      // Wrap the translation using a single-copy threshold to create infinite loop illusion
      const limit = -100 / numCopies;
      if (position.current <= limit) {
        position.current = 0;
      } else if (position.current >= 0) {
        position.current = limit;
      }

      // Apply transform to all marquee rows
      if (containerRef.current) {
        const rows = containerRef.current.querySelectorAll(".velocity-row-inner");
        rows.forEach((row) => {
          (row as HTMLDivElement).style.transform = `translate3d(${position.current}%, 0, 0)`;
        });
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [velocity, damping, stiffness, numCopies]);

  if (!texts || texts.length === 0) return null;

  // Duplicate the text string array to ensure continuous repetition
  const copies = Array.from({ length: numCopies });

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none py-4 bg-background ${className}`}
    >
      {/* Scroll velocity row */}
      <div className="flex w-full overflow-hidden">
        <div
          className="velocity-row-inner flex whitespace-nowrap will-change-transform"
          style={{
            display: "flex",
            width: "max-content",
          }}
        >
          {copies.map((_, copyIdx) => (
            <div key={copyIdx} className="flex items-center gap-12 px-6">
              {texts.map((txt, txtIdx) => (
                <span
                  key={`${copyIdx}-${txtIdx}`}
                  className="font-display text-4xl font-bold uppercase tracking-wider text-muted-foreground/30 hover:text-[var(--accent-cyan)] transition-colors duration-300 md:text-6xl lg:text-7xl"
                >
                  {txt}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
