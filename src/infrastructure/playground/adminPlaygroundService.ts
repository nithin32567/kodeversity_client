import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";
import type { TemplateConfig } from "@/domain/playground";

export interface KernelsResponse {
  source: string;
  data: string[];
}

export interface SnapshotsResponse {
  source: string;
  data: string[];
}

export const adminPlaygroundService = {
  listTemplates: async (): Promise<TemplateConfig[]> => {
    return apiClient.get<TemplateConfig[]>(endpoints.playground.adminTemplateConfig);
  },

  listPlaygrounds: async (): Promise<unknown[]> => {
    const res = await apiClient.get<{ result: unknown[] }>(endpoints.playground.adminPlaygrounds);
    return res.result || [];
  },

  createTemplate: async (
    config: Omit<TemplateConfig, "_id">,
  ): Promise<{ message: string; id: string }> => {
    return apiClient.post<{ message: string; id: string }>(
      endpoints.playground.adminTemplateConfig,
      { config },
    );
  },

  deleteTemplate: async (id: string): Promise<{ message: string; id: string }> => {
    return apiClient.del<{ message: string; id: string }>(
      endpoints.playground.adminTemplateConfigId(id),
    );
  },

  getKernels: async (): Promise<KernelsResponse> => {
    return apiClient.get<KernelsResponse>(endpoints.playground.adminKernels);
  },

  getSnapshots: async (): Promise<SnapshotsResponse> => {
    return apiClient.get<SnapshotsResponse>(endpoints.playground.adminSnapshots);
  },
};
