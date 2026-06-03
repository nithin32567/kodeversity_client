import type { User } from "@/domain/user";
import type { RegisterPayload, OtpPayload } from "@/domain/auth";
import { apiClient, tokenStore } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";

export interface LoginPayload {
  email: string;
  password: string;
}

// Shape returned by POST /api/auth/login (after envelope unwrap by apiClient)
interface LoginData {
  accessToken: string;
  user: User;
}

// Shape returned by POST /api/auth/register (after envelope unwrap: { userId })
interface RegisterData {
  userId: string;
}

// Shape returned by POST /api/auth/refresh (after envelope unwrap: { accessToken })
interface RefreshData {
  accessToken: string;
}

// Shape returned by GET /api/auth/verify-token
interface VerifyTokenData {
  user: { id: string; role: string };
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
};
