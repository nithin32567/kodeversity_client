import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ViewAllCard() {
  return (
    <Link
      to="/courses"
      className="group flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-[var(--accent-cyan)] hover:shadow-[0_0_30px_-10px_var(--accent-cyan)]"
    >
      <h3 className="text-xl font-bold text-foreground">View All</h3>
      <h3 className="mb-4 text-xl font-bold text-foreground">Courses</h3>
      <ArrowRight className="h-6 w-6 text-[var(--accent-cyan)] transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
