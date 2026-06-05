import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AppShell } from "@/presentation/global/AppShell";

export function ComingSoon({
  title,
  activeTop,
  wrap = true,
}: {
  title: string;
  activeTop?: string;
  wrap?: boolean;
}) {
  const content = (
    <section className="relative grid min-h-[calc(100vh-4rem)] place-items-center overflow-hidden px-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 30%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%), radial-gradient(40% 40% at 70% 80%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            In the works
          </div>
          <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">{title}</h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            We're crafting something exceptional here. Check back soon — this experience is
            launching shortly.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/[0.04]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Courses
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-primary)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-primary)] transition-transform hover:scale-[1.02]"
            >
              Go Home
            </Link>
          </div>
        </div>
      </section>
  );

  if (!wrap) return content;
  return <AppShell activeTop={activeTop}>{content}</AppShell>;
}
