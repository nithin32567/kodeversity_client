import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/presentation/components/student/ComingSoon";

export const Route = createFileRoute("/mentorship")({
  head: () => ({ meta: [{ title: "Mentorship — Kodeversity" }] }),
  component: () => <ComingSoon title="Mentorship" />,
});
