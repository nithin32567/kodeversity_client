const AUTH_URL = (import.meta.env.VITE_AUTH_SERVICE_URL as string) ?? "http://localhost:4000";
const COURSE_URL = (import.meta.env.VITE_COURSE_SERVICE_URL as string) ?? "http://localhost:4001";
const USER_URL = (import.meta.env.VITE_USER_SERVICE_URL as string) ?? "http://localhost:4003";
const PROGRESS_URL =
  (import.meta.env.VITE_PROGRESS_SERVICE_URL as string) ?? "http://localhost:4004";
const CHALLENGE_URL =
  (import.meta.env.VITE_CHALLENGE_SERVICE_URL as string) ?? "http://localhost:4005";
const ADMIN_URL = (import.meta.env.VITE_ADMIN_SERVICE_URL as string) ?? "http://localhost:4002";
const MEETING_URL = (import.meta.env.VITE_MEETING_SERVICE_URL as string) ?? "http://localhost:4002";
const PLAYGROUND_URL =
  (import.meta.env.VITE_PLAYGROUND_SERVICE_URL as string) ?? "http://localhost:3000";

export const endpoints = {
  auth: {
    login: `${AUTH_URL}/api/auth/login`,
    logout: `${AUTH_URL}/api/auth/logout`,
    refresh: `${AUTH_URL}/api/auth/refresh`,
    verifyToken: `${AUTH_URL}/api/auth/verify-token`,
    register: `${AUTH_URL}/api/auth/register`,
    sendOtp: `${AUTH_URL}/api/auth/otp-send`,
    verifyOtp: `${AUTH_URL}/api/auth/otp-verify`,
    updatePassword: `${AUTH_URL}/api/auth/update-password`,
  },
  course: {
    list: `${COURSE_URL}/api/courses`,
    levels: `${COURSE_URL}/api/courses/levels`,
    bySlug: (slug: string) => `${COURSE_URL}/api/courses/${slug}`,
    content: (courseId: string) => `${COURSE_URL}/api/v1/courses/${courseId}/content`,
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
    fetchChapterVideo: (chapterId: string) =>
      `${COURSE_URL}/api/modules/chapters/${chapterId}/video`,
    updateLessonProgress: (lessonId: string) =>
      `${COURSE_URL}/api/v1/lessons/${lessonId}/progress`,
    getLessonProgress: (lessonId: string) =>
      `${COURSE_URL}/api/v1/lessons/${lessonId}/progress`,
    myCourseProgress: (courseId: string) =>
      `${COURSE_URL}/api/v1/courses/${courseId}/my-progress`,
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
    // Curriculum gating — student facing
    requestUnlock: () =>
      `${COURSE_URL}/api/v1/modules/request-unlock`,
    moduleLockStatus: (courseSlug: string) =>
      `${PROGRESS_URL}/progress/${courseSlug}/module-lock-status`,
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
    archivedCourses: `${COURSE_URL}/api/admin/courses/archived`,
    suspendCourse: (id: string) => `${COURSE_URL}/api/courses/${id}/suspend`,
    deleteCourse: (id: string) => `${COURSE_URL}/api/courses/${id}`,
    restoreCourse: (id: string) => `${COURSE_URL}/api/courses/${id}/restore`,
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
    enrollStudent: `${COURSE_URL}/api/admin/courses/enroll`,
    suspendedUsers: `${AUTH_URL}/api/admin/users/suspended`,
    updateUserStatus: (id: string) => `${AUTH_URL}/api/admin/users/${id}/status`,
    deleteUser: (id: string) => `${AUTH_URL}/api/admin/users/${id}`,
    // Curriculum gating
    pendingUnlockRequests: `${COURSE_URL}/api/v1/modules/pending-requests`,
    allUnlockRequests: `${COURSE_URL}/api/v1/modules/unlock-requests`,
    approveUnlockRequest: (requestId: string) =>
      `${COURSE_URL}/api/v1/modules/unlock-requests/${requestId}/approve`,
    rejectUnlockRequest: (requestId: string) =>
      `${COURSE_URL}/api/v1/modules/unlock-requests/${requestId}/reject`,
    patchUnlockRequest: (requestId: string) =>
      `${COURSE_URL}/api/v1/modules/unlock-requests/${requestId}`,
    accessOverride: (enrollmentId: string) =>
      `${COURSE_URL}/api/v1/enrollments/${enrollmentId}/access-override`,
  },
  instructor: {
    myCourses: `${COURSE_URL}/api/instructor/courses`,
    myBatches: `${COURSE_URL}/api/instructor/batches`,
    createCourse: `${COURSE_URL}/api/instructor/courses`,

    createModule: (courseId: string) => `${COURSE_URL}/api/courses/${courseId}/modules`,
    updateModule: (moduleId: string) => `${COURSE_URL}/api/modules/${moduleId}`,
    deleteModule: (moduleId: string) => `${COURSE_URL}/api/modules/${moduleId}`,
    createChapter: (moduleId: string) => `${COURSE_URL}/api/modules/${moduleId}/chapters`,
    updateChapter: (chapterId: string) => `${COURSE_URL}/api/chapters/${chapterId}`,
    deleteChapter: (chapterId: string) => `${COURSE_URL}/api/chapters/${chapterId}`,
    batchRoster: (batchId: string) => `${COURSE_URL}/api/batches/${batchId}/students`,

    meetings: `${MEETING_URL}/api/meetings`,
    meetingsByBatch: (batchId: string) => `${MEETING_URL}/api/meetings/batch/${batchId}`,

    // Curriculum gating — instructor-facing unlock requests
    pendingUnlockRequests: `${COURSE_URL}/api/v1/modules/pending-requests`,
    myUnlockRequests: `${COURSE_URL}/api/v1/modules/unlock-requests/instructor`,
    approveUnlockRequest: (requestId: string) =>
      `${COURSE_URL}/api/v1/modules/unlock-requests/${requestId}/approve`,
    rejectUnlockRequest: (requestId: string) =>
      `${COURSE_URL}/api/v1/modules/unlock-requests/${requestId}/reject`,
    patchUnlockRequest: (requestId: string) =>
      `${COURSE_URL}/api/v1/modules/unlock-requests/${requestId}`,
  },
  playground: {
    generateId: (pg: string, pgname: string, playground: string, from: string, fromId: string) =>
      `${PLAYGROUND_URL}/api/v1/generate-id/${pg}/${pgname}/${playground}/${from}/${fromId}`,

    create: (id: string) => `${PLAYGROUND_URL}/api/v1/playground/${id}`,

    poll: (id: string) => `${PLAYGROUND_URL}/api/v1/pg-poll/${id}`,

    getIp: (id: string) => `${PLAYGROUND_URL}/api/v1/get-ip/${id}`,

    checkTestGet: (id: string, vm: string, test: string) =>
      `${PLAYGROUND_URL}/api/v1/check-test/${id}/${vm}/${test}`,
    checkTestPost: (id: string, vm: string) =>
      `${PLAYGROUND_URL}/api/v1/check-test/${id}/${vm}/test`,

    score: `${PLAYGROUND_URL}/api/v1/admin/score`,
    xp: `${PLAYGROUND_URL}/api/v1/admin/xp`,

    remove: (id: string) => `${PLAYGROUND_URL}/api/v1/playground/${id}`,

    active: `${PLAYGROUND_URL}/api/v1/active-playgrounds`,
    list: `${PLAYGROUND_URL}/api/v1/playground`,
    templateConfig: (pgid: string) => `${PLAYGROUND_URL}/api/v1/template-config/${pgid}`,
    adminTemplateConfig: `${PLAYGROUND_URL}/api/v1/admin/template-config`,
    adminTemplateConfigId: (id: string) => `${PLAYGROUND_URL}/api/v1/admin/template-config/${id}`,
    adminPlaygrounds: `${PLAYGROUND_URL}/api/v1/admin/playgrounds`,
    adminKernels: `${PLAYGROUND_URL}/api/v1/admin/kernels`,
    adminSnapshots: `${PLAYGROUND_URL}/api/v1/admin/snapshots`,

    openCodeServer: (id: string) => `${PLAYGROUND_URL}/api/v1/open-code-server/${id}`,
    openDesktopServer: (id: string) => `${PLAYGROUND_URL}/api/v1/open-desktop-server/${id}`,
  },
} as const;
