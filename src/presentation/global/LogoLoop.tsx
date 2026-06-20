import React, { useState } from "react";

export interface LogoItem {
  node?: React.ReactNode;
  title?: string;
  href?: string;
  src?: string;
  alt?: string;
}

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  logoHeight?: number;
  gap?: number;
  hoverSpeed?: number;
  scaleOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  ariaLabel?: string;
  useCustomRender?: boolean;
}

export default function LogoLoop({
  logos,
  speed = 100,
  direction = "left",
  logoHeight = 60,
  gap = 60,
  hoverSpeed = 0,
  scaleOnHover = false,
  fadeOut = false,
  fadeOutColor = "var(--background, #09090b)",
  ariaLabel = "Partners and Technologies",
  useCustomRender = false,
}: LogoLoopProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!logos || logos.length === 0) return null;

  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

  const isVertical = direction === "up" || direction === "down";

  const duration = speed > 0 ? `${1200 / speed}s` : "0s";
  const hoverDuration = hoverSpeed > 0 ? `${1200 / hoverSpeed}s` : "0s";

  const animationName = `logo-loop-${direction}`;

  const styleId = `logo-loop-styles-${direction}`;

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full overflow-hidden ${
        isVertical ? "h-full flex flex-col justify-center" : "flex items-center"
      }`}
      style={{
        height: isVertical ? "100%" : `${logoHeight + 24}px`,
      }}
    >
      {}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes logo-loop-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        @keyframes logo-loop-right {
          0% { transform: translateX(-25%); }
          100% { transform: translateX(0); }
        }
        @keyframes logo-loop-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-25%); }
        }
        @keyframes logo-loop-down {
          0% { transform: translateY(-25%); }
          100% { transform: translateY(0); }
        }
      `,
        }}
      />

      <div
        className="flex"
        style={{
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          gap: `${gap}px`,
          width: isVertical ? "100%" : "max-content",
          height: isVertical ? "max-content" : "100%",
          alignItems: "center",
          animationName: animationName,
          animationDuration: duration,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationPlayState: isHovered && hoverSpeed === 0 ? "paused" : "running",
        }}
      >
        {duplicatedLogos.map((logo, idx) => {
          const content = logo.node ? (
            <div
              className="flex items-center justify-center text-muted-foreground hover:text-[var(--accent-cyan)] transition-colors duration-300"
              style={{ height: `${logoHeight}px`, fontSize: `${logoHeight * 0.6}px` }}
            >
              {logo.node}
            </div>
          ) : (
            <img
              src={logo.src}
              alt={logo.alt || logo.title || "Logo"}
              style={{
                height: `${logoHeight}px`,
                objectFit: "contain",
              }}
              className="opacity-70 hover:opacity-100 transition-opacity duration-300"
            />
          );

          return (
            <div
              key={idx}
              className={`flex items-center justify-center shrink-0 transition-transform duration-300 ${
                scaleOnHover ? "hover:scale-110" : ""
              }`}
              style={{
                height: `${logoHeight}px`,
                width: isVertical ? "100%" : "auto",
              }}
            >
              {logo.href ? (
                <a
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={logo.title}
                  className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] rounded-md"
                >
                  {content}
                </a>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>

      {}
      {fadeOut && !isVertical && (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to right, ${fadeOutColor}, transparent)`,
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to left, ${fadeOutColor}, transparent)`,
            }}
          />
        </>
      )}

      {fadeOut && isVertical && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to bottom, ${fadeOutColor}, transparent)`,
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to top, ${fadeOutColor}, transparent)`,
            }}
          />
        </>
      )}
    </div>
  );
}
