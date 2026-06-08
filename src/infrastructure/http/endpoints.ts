const AUTH_URL = (import.meta.env.VITE_AUTH_SERVICE_URL as string) ?? "http://localhost:4000";
const COURSE_URL = (import.meta.env.VITE_COURSE_SERVICE_URL as string) ?? "http://localhost:4001";
const USER_URL = (import.meta.env.VITE_USER_SERVICE_URL as string) ?? "http://localhost:4003";
const PROGRESS_URL =
  (import.meta.env.VITE_PROGRESS_SERVICE_URL as string) ?? "http://localhost:4004";
const CHALLENGE_URL =
  (import.meta.env.VITE_CHALLENGE_SERVICE_URL as string) ?? "http://localhost:4005";
const ADMIN_URL = (import.meta.env.VITE_ADMIN_SERVICE_URL as string) ?? "http://localhost:4002";
const MEETING_URL = (import.meta.env.VITE_MEETING_SERVICE_URL as string) ?? "http://localhost:4002";

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
    list: `${COURSE_URL}/api/courses`,
    levels: `${COURSE_URL}/api/courses/levels`,
    bySlug: (slug: string) => `${COURSE_URL}/api/courses/${slug}`,
    lessons: (slug: string) => `${COURSE_URL}/api/courses/${slug}/lessons`,
    lessonById: (courseSlug: string, lessonId: string) =>
      `${COURSE_URL}/api/courses/${courseSlug}/lessons/${lessonId}`,
    createInstructor: `${COURSE_URL}/api/courses/instructors`,
    assignInstructor: (courseId: string) => `${COURSE_URL}/api/courses/${courseId}/instructor`,
    enrolledStudents: (courseId: string) =>
      `${COURSE_URL}/api/courses/${courseId}/enrolled-students`,
    createModule: (courseId: string) => `${COURSE_URL}/api/courses/${courseId}/modules`,
    updateModule: (moduleId: string) => `${COURSE_URL}/api/modules/${moduleId}`,
    deleteModule: (moduleId: string) => `${COURSE_URL}/api/modules/${moduleId}`,
    reorderModules: (courseId: string) => `${COURSE_URL}/api/courses/${courseId}/modules/reorder`,
    createChapter: (moduleId: string) => `${COURSE_URL}/api/modules/${moduleId}/chapters`,
    updateChapter: (chapterId: string) => `${COURSE_URL}/api/chapters/${chapterId}`,
    deleteChapter: (chapterId: string) => `${COURSE_URL}/api/chapters/${chapterId}`,
    reorderChapters: (moduleId: string) => `${COURSE_URL}/api/modules/${moduleId}/chapters/reorder`,
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
    bySlug: (slug: string) => `${CHALLENGE_URL}/challenges/${slug}`,
    byId: (id: string) => `${CHALLENGE_URL}/challenges/${id}`,
    submit: (id: string) => `${CHALLENGE_URL}/challenges/${id}/submit`,
  },
  admin: {
    analytics: `${COURSE_URL}/api/admin/analytics`,
    courses: `${COURSE_URL}/api/courses`,
    users: `${ADMIN_URL}/api/admin/users`,
    createUser: `${AUTH_URL}/api/admin/users/create`,
    updateUser: (id: string) => `${AUTH_URL}/api/admin/users/${id}`,
    students: `${AUTH_URL}/api/auth/students`,
    instructors: `${AUTH_URL}/api/auth/instructors`,
    batches: `${COURSE_URL}/api/batches`,
    updateBatch: (batchId: string) => `${COURSE_URL}/api/batches/${batchId}`,
    updateBatchStatus: (batchId: string) => `${COURSE_URL}/api/batches/${batchId}/status`,
    assignInstructorBatch: (batchId: string) =>
      `${COURSE_URL}/api/admin/batches/${batchId}/assign-instructor`,
    deleteBatch: (batchId: string) => `${COURSE_URL}/api/batches/${batchId}`,
    batchStudents: (batchId: string) => `${COURSE_URL}/api/batches/${batchId}/students`,
    removeStudentFromBatch: (batchId: string, studentId: string) =>
      `${COURSE_URL}/api/batches/${batchId}/students/${studentId}`,
    suspendedUsers: `${AUTH_URL}/api/admin/users/suspended`,
    updateUserStatus: (id: string) => `${AUTH_URL}/api/admin/users/${id}/status`,
    deleteUser: (id: string) => `${AUTH_URL}/api/admin/users/${id}`,
  },
  instructor: {
    // Dedicated instructor-scoped endpoints (backend filters by JWT's instructorId)
    myCourses: `${COURSE_URL}/api/instructor/courses`,
    myBatches: `${COURSE_URL}/api/instructor/batches`,
    createCourse: `${COURSE_URL}/api/instructor/courses`,
    // Module & chapter management — shared with admin but instructor-gated on backend
    createModule: (courseId: string) => `${COURSE_URL}/api/courses/${courseId}/modules`,
    updateModule: (moduleId: string) => `${COURSE_URL}/api/modules/${moduleId}`,
    deleteModule: (moduleId: string) => `${COURSE_URL}/api/modules/${moduleId}`,
    createChapter: (moduleId: string) => `${COURSE_URL}/api/modules/${moduleId}/chapters`,
    updateChapter: (chapterId: string) => `${COURSE_URL}/api/chapters/${chapterId}`,
    deleteChapter: (chapterId: string) => `${COURSE_URL}/api/chapters/${chapterId}`,
    batchRoster: (batchId: string) => `${COURSE_URL}/api/batches/${batchId}/students`,
    // Meetings — instructor creates & joins sessions for accessible batches
    meetings: `${MEETING_URL}/api/meetings`,
    meetingsByBatch: (batchId: string) => `${MEETING_URL}/api/meetings/batch/${batchId}`,
  },
} as const;
