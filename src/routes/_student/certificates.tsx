import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/presentation/global/ComingSoon";

export const Route = createFileRoute("/_student/certificates")({
  head: () => ({ meta: [{ title: "Certificates — Kodeversity" }] }),
  component: () => <ComingSoon title="Certificates" wrap={false} />,
});
