import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/presentation/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Kodeversity" }] }),
  component: () => <ComingSoon title="Dashboard" />,
});
