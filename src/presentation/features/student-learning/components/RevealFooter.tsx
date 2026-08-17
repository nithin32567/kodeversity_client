import { useEffect, useRef, useState } from "react";

const navColumns = [
  {
    items: [
      { label: "Courses", href: "#courses" },
      { label: "Challenges", href: "#challenges" },
      { label: "Playgrounds", href: "#playgrounds" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#changelog" },
      { label: "Docs", href: "#docs" },
    ],
  },
  {
    items: [
      { label: "Blog", href: "#blog" },
      { label: "Community", href: "#community" },
      { label: "Careers", href: "#careers" },
    ],
  },
];

export function RevealFooter() {
  const ref = useRef<HTMLElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      {}
      <div aria-hidden style={{ height }} />

      <footer
        ref={ref}
        id="footer"
        className="fixed bottom-0 left-0 right-0 z-0 w-full bg-background text-foreground"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 pt-16 pb-8 md:pt-24">
          {}
          <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
            <div className="max-w-md">
              <p className="font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                Prepare for launch.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Real clusters, real pipelines, real terminals — engineering you can actually
                navigate.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 md:gap-16">
              {navColumns.map((col, i) => (
                <ul key={i} className="space-y-3">
                  {col.items.map((it) => (
                    <li key={it.label}>
                      <a
                        href={it.href}
                        className="text-base text-foreground/90 transition-colors hover:text-[var(--accent-cyan)]"
                      >
                        {it.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          {}
          <div className="relative w-full overflow-hidden flex justify-center py-2">
            <h2
              aria-hidden
              className="select-none whitespace-nowrap font-display font-black leading-[0.95] tracking-[-0.06em] text-foreground text-center pb-[0.08em]"
              style={{ fontSize: "clamp(3rem, 14.8vw, 12.5rem)" }}
            >
              Study Laah
            </h2>
          </div>

          {}
          <div className="flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-6 text-sm text-muted-foreground md:flex-row md:items-center">
            <span className="font-mono text-xs tracking-widest uppercase">
              © {new Date().getFullYear()} Study Laah
            </span>
            <nav className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <a href="#about" className="hover:text-foreground transition-colors">
                About
              </a>
              <a href="#products" className="hover:text-foreground transition-colors">
                Products
              </a>
              <a href="#privacy" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#terms" className="hover:text-foreground transition-colors">
                Terms
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}

export default RevealFooter;
