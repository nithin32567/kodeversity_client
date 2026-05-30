import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/presentation/components/student/ComingSoon";

export const Route = createFileRoute("/_student/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Kodeversity" }] }),
  component: () => <ComingSoon title="Dashboard" />,
});
