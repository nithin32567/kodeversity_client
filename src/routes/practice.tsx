import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/presentation/components/student/ComingSoon";

export const Route = createFileRoute("/practice")({
  head: () => ({ meta: [{ title: "Practice — Kodeversity" }] }),
  component: () => <ComingSoon title="Practice Arena" />,
});
