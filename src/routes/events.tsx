import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/presentation/global/ComingSoon";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — Kodeversity" }] }),
  component: () => <ComingSoon title="Events" />,
});
