import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/presentation/components/student/ComingSoon";

export const Route = createFileRoute("/roadmaps")({
  head: () => ({ meta: [{ title: "Roadmaps — Kodeversity" }] }),
  component: () => <ComingSoon title="Roadmaps" />,
});
