import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/presentation/components/student/ComingSoon";

export const Route = createFileRoute("/_student/settings")({
  head: () => ({ meta: [{ title: "Settings — Kodeversity" }] }),
  component: () => <ComingSoon title="Settings" />,
});
