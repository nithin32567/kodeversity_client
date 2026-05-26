// ---------------------------------------------------------------------------
// Service base URLs — set these in your .env file.
// Each key maps to one Express microservice.
// ---------------------------------------------------------------------------

const AUTH_URL = (import.meta.env.VITE_AUTH_SERVICE_URL as string) ?? "http://localhost:4000";
const COURSE_URL = (import.meta.env.VITE_COURSE_SERVICE_URL as string) ?? "http://localhost:4002";
const USER_URL = (import.meta.env.VITE_USER_SERVICE_URL as string) ?? "http://localhost:4003";
const PROGRESS_URL =
  (import.meta.env.VITE_PROGRESS_SERVICE_URL as string) ?? "http://localhost:4004";
const CHALLENGE_URL =
  (import.meta.env.VITE_CHALLENGE_SERVICE_URL as string) ?? "http://localhost:4005";

export const endpoints = {
  auth: {
    login: `${AUTH_URL}/api/auth/login`,
    logout: `${AUTH_URL}/api/auth/logout`,
    refresh: `${AUTH_URL}/api/auth/refresh`,
    verifyToken: `${AUTH_URL}/api/auth/verify-token`,
    register: `${AUTH_URL}/api/auth/register`,
    sendOtp: `${AUTH_URL}/api/auth/otp-send`,
    verifyOtp: `${AUTH_URL}/api/auth/otp-verify`,
  },
  course: {
    list: `${COURSE_URL}/courses`,
    bySlug: (slug: string) => `${COURSE_URL}/courses/${slug}`,
    lessons: (slug: string) => `${COURSE_URL}/courses/${slug}/lessons`,
    lessonById: (courseSlug: string, lessonId: string) =>
      `${COURSE_URL}/courses/${courseSlug}/lessons/${lessonId}`,
  },
  user: {
    profile: `${USER_URL}/users/me`,
    updateProfile: `${USER_URL}/users/me`,
    avatar: `${USER_URL}/users/me/avatar`,
  },
  progress: {
    get: (courseSlug: string) => `${PROGRESS_URL}/progress/${courseSlug}`,
    markComplete: (courseSlug: string, lessonId: string) =>
      `${PROGRESS_URL}/progress/${courseSlug}/lessons/${lessonId}/complete`,
    certificates: `${PROGRESS_URL}/certificates`,
  },
  challenge: {
    list: `${CHALLENGE_URL}/challenges`,
    byId: (id: string) => `${CHALLENGE_URL}/challenges/${id}`,
    submit: (id: string) => `${CHALLENGE_URL}/challenges/${id}/submit`,
  },
} as const;
