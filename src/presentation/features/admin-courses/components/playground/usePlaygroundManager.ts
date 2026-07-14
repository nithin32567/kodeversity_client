import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { adminPlaygroundService } from "@/infrastructure/playground/adminPlaygroundService";
import { useConfirm } from "@/presentation/global/contexts/ConfirmContext";
import type { TemplateConfig } from "@/domain/playground";
import type { ActivePlayground, InspectingInstance } from "./types";

export function usePlaygroundManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<(TemplateConfig & { _id: string }) | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"templates" | "instances">("templates");
  const [inspectingInstance, setInspectingInstance] = useState<InspectingInstance | null>(null);
  const { confirm } = useConfirm();

  // ── Templates state ────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<(TemplateConfig & { _id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await adminPlaygroundService.listTemplates();
      setTemplates(data as (TemplateConfig & { _id: string })[]);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  // ── Active playgrounds state ───────────────────────────────────────────────
  const [activePlaygrounds, setActivePlaygrounds] = useState<ActivePlayground[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);

  const fetchInstances = useCallback(async () => {
    setIsLoadingInstances(true);
    try {
      const data = await adminPlaygroundService.listPlaygrounds();
      setActivePlaygrounds(data as ActivePlayground[]);
    } catch {
      // silently fail for instances
    } finally {
      setIsLoadingInstances(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "instances") void fetchInstances();
  }, [activeTab, fetchInstances]);

  // ── Delete mutation ────────────────────────────────────────────────────────
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: "Delete Profile",
      message: `Are you sure you want to delete the "${name}" baseline profile?`,
      confirmText: "Delete",
      destructive: true,
    });
    if (!isConfirmed) return;
    setIsDeleting(true);
    try {
      await adminPlaygroundService.deleteTemplate(id);
      toast.success("Playground template deleted successfully");
      void fetchTemplates();
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete playground template");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    state: {
      isFormOpen,
      isEditModalOpen,
      selectedConfig,
      activeTab,
      inspectingInstance,
      templates,
      isLoading,
      isError,
      activePlaygrounds,
      isLoadingInstances,
      isDeleting,
    },
    actions: {
      setIsFormOpen,
      setIsEditModalOpen,
      setSelectedConfig,
      setActiveTab,
      setInspectingInstance,
      fetchTemplates,
      fetchInstances,
      handleDelete,
    },
  };
}
