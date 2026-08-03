import { Plus, Loader2, RefreshCw, Layers, Activity, Server, Terminal, X } from "lucide-react";
import { PlaygroundWorkspace } from "@/presentation/features/playground";
import CreateConfigModal from "./CreateConfigModal";
import EditConfigModal from "./EditConfigModal";
import { usePlaygroundManager } from "./playground/usePlaygroundManager";
import { PlaygroundTemplateCard } from "./playground/PlaygroundTemplateCard";
import { PlaygroundInstanceCard } from "./playground/PlaygroundInstanceCard";
import { toast } from "sonner";

export function PlaygroundManager() {
  const { state, actions } = usePlaygroundManager();

  return (
    <div className="max-w-7xl mx-auto space-y-6 w-full my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl font-display text-foreground">
            Playground Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure baseline templates and monitor active running containers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              void (state.activeTab === "templates"
                ? actions.fetchTemplates()
                : actions.fetchInstances())
            }
            disabled={state.activeTab === "templates" ? state.isLoading : state.isLoadingInstances}
            className="p-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)] text-muted-foreground hover:text-foreground transition cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${(state.activeTab === "templates" ? state.isLoading : state.isLoadingInstances) ? "animate-spin" : ""}`}
            />
          </button>

          {state.activeTab === "templates" && (
            <button
              onClick={() => actions.setIsFormOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-cta)] text-xs font-semibold text-white px-4 py-2.5 shadow-md shadow-indigo-500/20 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--hairline)] pb-2">
        <button
          onClick={() => actions.setActiveTab("templates")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            state.activeTab === "templates"
              ? "bg-indigo-500/10 text-indigo-400"
              : "text-muted-foreground hover:bg-white/[0.04]"
          }`}
        >
          Baseline Profiles
        </button>
        <button
          onClick={() => actions.setActiveTab("instances")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            state.activeTab === "instances"
              ? "bg-indigo-500/10 text-indigo-400"
              : "text-muted-foreground hover:bg-white/[0.04]"
          }`}
        >
          <Activity className="h-4 w-4" />
          Active Instances
        </button>
      </div>

      {/* Content */}
      {state.activeTab === "templates" ? (
        <>
          {/* Templates Tab */}
          {state.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col h-[180px] rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/20 animate-pulse overflow-hidden p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-white/[0.04] rounded w-2/3" />
                    <div className="h-5 bg-white/[0.04] rounded w-1/5" />
                  </div>
                  <div className="h-3 bg-white/[0.04] rounded w-full" />
                  <div className="h-3 bg-white/[0.04] rounded w-4/5" />
                  <div className="flex gap-2 pt-4">
                    <div className="h-5 bg-white/[0.04] rounded w-1/3" />
                    <div className="h-5 bg-white/[0.04] rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : state.isError ? (
            <div className="p-8 border border-red-500/10 bg-red-500/5 rounded-2xl text-center space-y-2">
              <p className="text-sm text-red-400 font-semibold">
                Unable to connect to SmartSpace Service
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Please check that the sandbox playground backend is running on Port 3000 and
                database credentials are correctly aligned.
              </p>
              <button
                onClick={() => void actions.fetchTemplates()}
                className="mt-4 px-3 py-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-xs text-foreground hover:bg-white/[0.02] transition"
              >
                Retry Connection
              </button>
            </div>
          ) : state.templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
              <Layers className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="font-semibold text-sm text-foreground/80">
                No playground profiles defined
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Create your first baseline container profile using the template builder to start
                linking labs to course lessons.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {state.templates.map((tpl) => (
                <PlaygroundTemplateCard
                  key={tpl._id}
                  tpl={tpl}
                  isDeleting={state.isDeleting}
                  onEdit={(config) => {
                    actions.setSelectedConfig(config);
                    actions.setIsEditModalOpen(true);
                  }}
                  onDelete={actions.handleDelete}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {state.isLoadingInstances ? (
            <div className="col-span-full py-12 flex justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : state.activePlaygrounds.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
              <Server className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="font-semibold text-sm text-foreground/80">No active instances</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                There are currently no running playgrounds in the system.
              </p>
            </div>
          ) : (
            state.activePlaygrounds.map((pg) => (
              <PlaygroundInstanceCard
                key={pg._id}
                pg={pg}
                onInspect={(id, postName, type) =>
                  actions.setInspectingInstance({ id, postName, type })
                }
              />
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {state.isFormOpen && (
        <CreateConfigModal
          isOpen={state.isFormOpen}
          onClose={() => actions.setIsFormOpen(false)}
          onSuccess={() => {
            void actions.fetchTemplates();
            toast.success("Profile created successfully!");
          }}
        />
      )}

      {state.isEditModalOpen && state.selectedConfig && (
        <EditConfigModal
          isOpen={state.isEditModalOpen}
          onClose={() => {
            actions.setIsEditModalOpen(false);
            actions.setSelectedConfig(null);
          }}
          onSuccess={() => {
            void actions.fetchTemplates();
            toast.success("Profile updated successfully!");
          }}
          config={state.selectedConfig}
        />
      )}

      {/* Inspecting Instance Overlay */}
      {state.inspectingInstance && (
        <div className="fixed inset-0 z-50 flex overflow-hidden bg-background/80 backdrop-blur-sm">
          <div className="w-full h-full md:w-[95vw] md:h-[95vh] md:m-auto flex flex-col bg-background border border-[var(--hairline)] md:rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border-[var(--hairline)] bg-[var(--surface)] shrink-0">
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-foreground">Admin Overriding Mode</h3>
                  <p className="text-xs text-muted-foreground">
                    Inspecting: {state.inspectingInstance.postName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => actions.setInspectingInstance(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 relative">
              <PlaygroundWorkspace
                config={{
                  language: "python",
                  problemDescription: "Admin inspecting instance",
                  hints: [],
                }}
                from="admin"
                fromId="admin-inspect"
                onStop={() => actions.setInspectingInstance(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
