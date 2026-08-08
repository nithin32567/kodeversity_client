import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiError } from "./src/infrastructure/http/ApiError";
import { apiRequest } from "./src/infrastructure/http/apiClient";
import { baseApi } from "./src/services/api";

async function test() {
  const err = new ApiError("msg", 409, "code", { attemptId: "123" });
  console.log("ApiError data:", err.data);
}
test();
