import { createFileRoute } from "@tanstack/react-router";
import { PlaygroundManager } from "@/presentation/features/admin-courses/components/PlaygroundManager";

export const Route = createFileRoute("/_auth/admin/playground")({
  head: () => ({ meta: [{ title: "Playground Management — Kodeversity" }] }),
  component: AdminPlaygroundPage,
});

function AdminPlaygroundPage() {
  return (
    <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8 space-y-6 overflow-y-auto max-w-[1400px] mx-auto w-full pt-4">
      <PlaygroundManager />
    </main>
  );
}
