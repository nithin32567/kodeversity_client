import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { UserRole } from "@/domain/auth";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicLayout } from "@/layouts/PublicLayout";
import { PortalLayout } from "@/presentation/global/layouts/PortalLayout";

import { LandingPage } from "@/pages/public/LandingPage";
import { LoginPage } from "@/pages/public/LoginPage";
import { RegisterPage } from "@/pages/public/RegisterPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";

const AdminDashboard = lazy(() =>
  import("@/pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })),
);
const AdminUsersPage = lazy(() =>
  import("@/pages/admin/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage })),
);
const AdminUserDetailsPage = lazy(() =>
  import("@/pages/admin/AdminUserDetailsPage").then((m) => ({ default: m.AdminUserDetailsPage })),
);
const AdminCoursesPage = lazy(() =>
  import("@/pages/admin/AdminCoursesPage").then((m) => ({ default: m.AdminCoursesPage })),
);
const AdminAnalyticsPage = lazy(() =>
  import("@/pages/admin/AdminAnalyticsPage").then((m) => ({ default: m.AdminAnalyticsPage })),
);
const AdminArchivePage = lazy(() =>
  import("@/pages/admin/AdminArchivePage").then((m) => ({ default: m.AdminArchivePage })),
);
const AdminEnrollmentsPage = lazy(() =>
  import("@/pages/admin/AdminEnrollmentsPage").then((m) => ({ default: m.AdminEnrollmentsPage })),
);
const AdminBatchesPage = lazy(() =>
  import("@/pages/admin/AdminBatchesPage").then((m) => ({ default: m.AdminBatchesPage })),
);
const AdminPlaygroundsPage = lazy(() =>
  import("@/pages/admin/AdminPlaygroundsPage").then((m) => ({ default: m.AdminPlaygroundsPage })),
);
const AdminInactiveUsersPage = lazy(() =>
  import("@/pages/admin/AdminInactiveUsersPage").then((m) => ({
    default: m.AdminInactiveUsersPage,
  })),
);
const AdminInstructorsPage = lazy(() =>
  import("@/pages/admin/AdminInstructorsPage").then((m) => ({ default: m.AdminInstructorsPage })),
);
const AdminLiveClassesPage = lazy(() =>
  import("@/pages/admin/AdminLiveClassesPage").then((m) => ({ default: m.AdminLiveClassesPage })),
);
const AdminManageCoursePage = lazy(() =>
  import("@/pages/admin/AdminManageCoursePage").then((m) => ({ default: m.AdminManageCoursePage })),
);
const AdminPreviewCoursePage = lazy(() =>
  import("@/pages/admin/AdminPreviewCoursePage").then((m) => ({
    default: m.AdminPreviewCoursePage,
  })),
);
const UnlockRequestsPage = lazy(() =>
  import("@/presentation/features/admin/pages/UnlockRequests").then((m) => ({
    default: m.UnlockRequests,
  })),
);

const InstructorDashboard = lazy(() =>
  import("@/pages/instructor/InstructorDashboard").then((m) => ({
    default: m.InstructorDashboard,
  })),
);
const InstructorCoursesPage = lazy(() =>
  import("@/pages/instructor/InstructorCoursesPage").then((m) => ({
    default: m.InstructorCoursesPage,
  })),
);
const InstructorMeetingsPage = lazy(() =>
  import("@/pages/instructor/InstructorMeetingsPage").then((m) => ({
    default: m.InstructorMeetingsPage,
  })),
);
const InstructorBatchesPage = lazy(() =>
  import("@/pages/instructor/InstructorBatchesPage").then((m) => ({
    default: m.InstructorBatchesPage,
  })),
);

const StudentDashboard = lazy(() =>
  import("@/pages/student/StudentDashboard").then((m) => ({ default: m.StudentDashboard })),
);
const StudentCoursesPage = lazy(() =>
  import("@/pages/student/StudentCoursesPage").then((m) => ({ default: m.StudentCoursesPage })),
);
const CourseDetailPage = lazy(() =>
  import("@/pages/student/CourseDetailPage").then((m) => ({ default: m.CourseDetailPage })),
);
const LessonPage = lazy(() =>
  import("@/pages/student/LessonPage").then((m) => ({ default: m.LessonPage })),
);
const StudentProfilePage = lazy(() =>
  import("@/pages/student/StudentProfilePage").then((m) => ({ default: m.StudentProfilePage })),
);
const StudentBatchesPage = lazy(() =>
  import("@/pages/student/StudentBatchesPage").then((m) => ({ default: m.StudentBatchesPage })),
);
const StudentCertificatesPage = lazy(() =>
  import("@/pages/student/StudentCertificatesPage").then((m) => ({
    default: m.StudentCertificatesPage,
  })),
);
const StudentSettingsPage = lazy(() =>
  import("@/pages/student/StudentSettingsPage").then((m) => ({ default: m.StudentSettingsPage })),
);
const StudentLiveClassesPage = lazy(() =>
  import("@/pages/student/StudentLiveClassesPage").then((m) => ({
    default: m.StudentLiveClassesPage,
  })),
);
const StudentChallengesPage = lazy(() =>
  import("@/pages/student/StudentChallengesPage").then((m) => ({
    default: m.StudentChallengesPage,
  })),
);
const MeetingRoomPage = lazy(() =>
  import("@/pages/MeetingRoomPage").then((m) => ({ default: m.MeetingRoomPage })),
);

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            {/* Dedicated admin login — no auth guard, admin-only portal */}
            <Route path="admin/login" element={<AdminLoginPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]} loginPath="/admin/login">
                <PortalLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="users/:userId" element={<AdminUserDetailsPage />} />
            {/* /admin/students alias for sidebar links */}
            <Route path="students" element={<AdminUsersPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="archive" element={<AdminArchivePage />} />
            <Route path="courses/:slug" element={<AdminManageCoursePage />} />
            <Route path="courses/view/:slug" element={<AdminPreviewCoursePage />} />
            <Route path="enrollments" element={<AdminEnrollmentsPage />} />
            <Route path="batches" element={<AdminBatchesPage />} />
            <Route path="playground" element={<AdminPlaygroundsPage />} />
            <Route path="inactive-users" element={<AdminInactiveUsersPage />} />
            <Route path="instructors" element={<AdminInstructorsPage />} />
            <Route path="live-classes" element={<AdminLiveClassesPage />} />
            <Route path="unlock-requests" element={<UnlockRequestsPage />} />
          </Route>

          <Route
            path="/instructor"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}
                loginPath="/admin/login"
              >
                <PortalLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="courses" element={<InstructorCoursesPage />} />
            <Route path="meetings" element={<InstructorMeetingsPage />} />
            <Route path="batches" element={<InstructorBatchesPage />} />
            <Route path="unlock-requests" element={<UnlockRequestsPage />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={[UserRole.STUDENT, UserRole.ADMIN]} loginPath="/login">
                <PortalLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCoursesPage />} />
            <Route path="courses/:slug" element={<CourseDetailPage />} />
            <Route path="courses/:slug/lessons/:lessonId" element={<LessonPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="batches" element={<StudentBatchesPage />} />
            <Route path="certificates" element={<StudentCertificatesPage />} />
            <Route path="settings" element={<StudentSettingsPage />} />
            <Route path="live-classes" element={<StudentLiveClassesPage />} />
            <Route path="challenges" element={<StudentChallengesPage />} />
          </Route>

          <Route
            path="/meetings/:meetingId"
            element={
              <ProtectedRoute
                allowedRoles={[UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN]}
                loginPath="/login"
              >
                <MeetingRoomPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
