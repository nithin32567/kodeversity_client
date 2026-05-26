import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/presentation/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/certificates")({
  head: () => ({ meta: [{ title: "Certificates — Kodeversity" }] }),
  component: () => <ComingSoon title="Certificates" />,
});
