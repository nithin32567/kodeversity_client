import { ApiError } from "./src/infrastructure/http/ApiError";

const err = new ApiError("My message", 409, "CODE", { attemptId: "123" });
console.log(err.message, err.status, err.code, err.data);
