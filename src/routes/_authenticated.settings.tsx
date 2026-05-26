import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/presentation/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Kodeversity" }] }),
  component: () => <ComingSoon title="Settings" />,
});
