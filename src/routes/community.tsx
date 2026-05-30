import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/presentation/global/ComingSoon";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Community — Kodeversity" }] }),
  component: () => <ComingSoon title="Community" />,
});
