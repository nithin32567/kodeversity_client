export enum UserRole {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
  INSTRUCTOR = "INSTRUCTOR",
}

export interface RegisterPayload {
  email: string;
  password: string;
  role?: "student" | "instructor";
}

export interface OtpPayload {
  email: string;
}

// Human-readable messages for API error codes from the auth service.
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_REGISTERED: "An account with this email already exists.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  EMAIL_NOT_VERIFIED: "Please verify your email before logging in.",
  OTP_INVALID: "The code you entered is incorrect.",
  OTP_EXPIRED: "This code has expired. Please request a new one.",
  OTP_NOT_FOUND: "No verification code found. Please request a new one.",
  USER_ALREADY_VERIFIED: "This email is already verified.",
  USER_NOT_FOUND: "No account found with this email.",
  MISSING_ACCESS_TOKEN: "Authentication required.",
  INVALID_OR_EXPIRED_ACCESS_TOKEN: "Your session has expired. Please log in again.",
  REFRESH_TOKEN_MISSING: "Session expired. Please log in again.",
  REFRESH_TOKEN_REUSE_DETECTED: "Security alert: please log in again.",
};

export function getAuthErrorMessage(code: string): string {
  return AUTH_ERROR_MESSAGES[code] ?? "Something went wrong. Please try again.";
}
