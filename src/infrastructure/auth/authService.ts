import type { User } from "@/domain/user";
import type { RegisterPayload, OtpPayload } from "@/domain/auth";
import { apiClient, tokenStore } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";

export interface LoginPayload {
  email: string;
  password: string;
}

interface LoginData {
  accessToken: string;
  user: User;
}

interface RegisterData {
  userId: string;
}

interface RefreshData {
  accessToken: string;
}

interface VerifyTokenData {
  user: { id: string; role: string };
}

export interface UpdatePasswordPayload {
  oldPassword?: string;
  newPassword?: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginData>(endpoints.auth.login, payload, { skipAuthRefresh: true }),

  register: (payload: RegisterPayload) =>
    apiClient.post<RegisterData>(endpoints.auth.register, payload, { skipAuthRefresh: true }),

  logout: () => apiClient.post<void>(endpoints.auth.logout, undefined),

  refresh: async (): Promise<RefreshData> => {
    const token = await tokenStore.refresh();
    if (!token) throw new Error("Session expired or refresh failed");
    return { accessToken: token };
  },

  verifyToken: () => apiClient.get<VerifyTokenData>(endpoints.auth.verifyToken),

  sendOtp: (payload: OtpPayload) =>
    apiClient.post<{ message: string }>(endpoints.auth.sendOtp, payload, { skipAuthRefresh: true }),

  verifyOtp: (payload: OtpPayload & { otp: string }) =>
    apiClient.post<{ message: string }>(endpoints.auth.verifyOtp, payload, {
      skipAuthRefresh: true,
    }),

  updatePassword: (payload: UpdatePasswordPayload) =>
    apiClient.put<{ message: string }>(endpoints.auth.updatePassword, payload),
};
