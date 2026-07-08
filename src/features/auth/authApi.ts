import { baseApi } from "@/services/api";
import { endpoints } from "@/infrastructure/http/endpoints";
import type { RegisterPayload, OtpPayload } from "@/domain/auth";

interface RegisterResponse {
  userId: string;
}

interface OtpResponse {
  message: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<RegisterResponse, RegisterPayload>({
      query: (body) => ({
        url: endpoints.auth.register,
        method: "POST",
        body,
        extraOptions: { skipAuthRefresh: true },
      }),
    }),

    sendOtp: build.mutation<OtpResponse, OtpPayload>({
      query: (body) => ({
        url: endpoints.auth.sendOtp,
        method: "POST",
        body,
        extraOptions: { skipAuthRefresh: true },
      }),
    }),

    verifyOtp: build.mutation<OtpResponse, OtpPayload & { otp: string }>({
      query: (body) => ({
        url: endpoints.auth.verifyOtp,
        method: "POST",
        body,
        extraOptions: { skipAuthRefresh: true },
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useRegisterMutation, useSendOtpMutation, useVerifyOtpMutation } = authApi;
