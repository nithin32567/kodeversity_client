import type { UserProfile } from "@/domain/user";
import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export const userService = {
  /** Get the current user's full profile. */
  getProfile: () => apiClient.get<UserProfile>(endpoints.user.profile),

  /** Update the current user's profile. */
  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.patch<UserProfile>(endpoints.user.updateProfile, payload),
};
