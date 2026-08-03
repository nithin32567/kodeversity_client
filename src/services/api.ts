import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { apiRequest, type ApiRequestInit } from "@/infrastructure/http/apiClient";

export interface ApiBaseQueryArgs {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;

  extraOptions?: Omit<ApiRequestInit, "method" | "body">;
}

const apiBaseQuery: BaseQueryFn<ApiBaseQueryArgs, unknown, unknown> = async ({
  url,
  method = "GET",
  body,
  extraOptions = {},
}) => {
  try {
    const data = await apiRequest(url, { method, body, ...extraOptions });
    return { data };
  } catch (err: any) {
    return { 
      error: {
        status: err?.status ?? "FETCH_ERROR",
        message: err?.message ?? "An unexpected network error occurred",
        code: err?.code ?? "UNKNOWN",
      } 
    };
  }
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: apiBaseQuery,
  tagTypes: [
    "Auth",
    "Courses",
    "Course",
    "Users",
    "Enrollments",
    "Analytics",
    "Batches",
    "Meetings",
    "Playgrounds",
    "Progress",
    "UnlockRequests",
  ],
  endpoints: () => ({}),
});
