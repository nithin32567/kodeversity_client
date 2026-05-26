import type { Challenge, Submission } from "@/domain/course";
import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";

export interface SubmitSolutionPayload {
  language: string;
  code: string;
}

export const challengeService = {
  /** Get all available challenges. */
  list: () => apiClient.get<Challenge[]>(endpoints.challenge.list),

  /** Get a single challenge by ID. */
  byId: (id: string) => apiClient.get<Challenge>(endpoints.challenge.byId(id)),

  /** Submit a solution for a challenge. */
  submit: (id: string, payload: SubmitSolutionPayload) =>
    apiClient.post<Submission>(endpoints.challenge.submit(id), payload),
};
