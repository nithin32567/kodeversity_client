# LMS Client Application Architecture & API Documentation

This document provides a comprehensive overview of the `lms-client` frontend application located at `/home/nithin/Desktop/client-kv/lms-client`. It details the underlying architectural patterns, routing mechanisms, and the exhaustive list of API integrations.

---

## 1. Application Overview & Directory Architecture

The `lms-client` is a modern frontend built using React and TypeScript. It strictly adheres to a **Clean Architecture** inspired structure to separate concerns between the UI, business logic, and external services.

### Core Directories (`src/`)
- **`domain/`**: Contains core types, interfaces, and business entities (e.g., `Course`, `User`, `Lesson`). This layer is entirely decoupled from UI and framework specifics.
- **`infrastructure/`**: Handles all external communications, such as API clients (`http`), error parsing, and specific service abstractions (`auth`, `course`, `admin`).
- **`presentation/`**: Contains the UI layers. This is further split into:
  - `core-ui`: Reusable, generic UI components (buttons, modals).
  - `features`: Feature-specific hooks, stores, and complex components (e.g., `authStore`).
  - `global`: Global layouts and configurations.
- **`routes/`**: Handles the file-based routing configuration powered by `@tanstack/react-router`.

---

## 2. State Management & Routing

### Routing (`router.tsx` & `@tanstack/react-router`)
The application utilizes a file-based routing approach generated into `routeTree.gen.ts`. The router context strictly relies on:
- **`queryClient`**: Using `@tanstack/react-query` to handle data-fetching, caching, and background synchronization.
- **`auth`**: An `authStore` snapshot is injected directly into the router context, allowing layouts and guards to restrict access dynamically based on authentication state.

### State Management
- Global auth state is handled by a reactive `authStore`.
- Remote state and asynchronous data fetches are purely managed via React Query, ensuring data freshness and robust loading/error states without boilerplate.

---

## 3. API Communication Architecture (`infrastructure/http`)

The application does **not** rely on large external libraries like Axios for its core REST calls. Instead, it uses a custom `apiClient.ts` wrapper around the native browser `fetch` API.

### Features of `apiClient.ts`:
1. **Silent Token Refresh**: Intercepts `401 Unauthorized` responses. If the error implies an expired access token, it silently calls the refresh endpoint (`/api/auth/refresh`), obtains a new token, and automatically retries the initial request.
2. **Centralized Error Handling**: Parses backend responses matching a specific envelope `ApiEnvelope<T>` (`{ success, data, message, error }`). If `success` is false or HTTP status is not OK, it throws a strongly typed `ApiError`.
3. **Session Intercepts**: In-memory token management prevents cross-site scripting (XSS) risks. If the refresh fails or the refresh token is missing, an `onUnauthorized` handler triggers a global logout.

---

## 4. API Documentation (`endpoints.ts`)

The application interacts with multiple backend microservices via the `endpoints.ts` file, utilizing environment variables to direct traffic (e.g., `AUTH_URL`, `COURSE_URL`, `USER_URL`, `PROGRESS_URL`, `CHALLENGE_URL`, `ADMIN_URL`).

### A. Authentication (`AUTH_URL`)
- `POST /api/auth/login`: Authenticate users.
- `POST /api/auth/logout`: End session.
- `POST /api/auth/refresh`: Silently refresh the short-lived access token.
- `POST /api/auth/verify-token`: Check token validity.
- `POST /api/auth/register`: Create a new user.
- `POST /api/auth/otp-send` & `POST /api/auth/otp-verify`: Manage OTP verification.

### B. Course Resources (`COURSE_URL`)
- `GET /api/courses`: List all accessible courses.
- `GET /api/courses/levels`: Retrieve categorization levels.
- `GET /api/courses/:slug`: Fetch detailed data for a specific course.
- `GET /api/courses/:slug/lessons`: Get the syllabus/lessons.
- `GET /api/courses/:slug/lessons/:lessonId`: Get a specific lesson's content.

### C. User Profile (`USER_URL`)
- `GET /users/me`: Fetch the current authenticated user's profile.
- `PUT /users/me`: Update profile details.
- `PUT /users/me/avatar`: Update user's avatar.

### D. Progress & Certificates (`PROGRESS_URL`)
- `GET /progress/:courseSlug`: Get user's progress for a course.
- `POST /progress/:courseSlug/lessons/:lessonId/complete`: Mark a lesson as finished.
- `GET /certificates`: Retrieve the user's earned certificates.

### E. Challenges (`CHALLENGE_URL`)
- `GET /challenges`: List available challenges.
- `GET /challenges/:slug` / `GET /challenges/:id`: Fetch challenge requirements.
- `POST /challenges/:id/submit`: Submit a solution for grading.

### F. Instructor Specific APIs
Instructors have specific rights scoped by their backend JWT:
- `GET /api/instructor/courses`: List courses taught by the instructor.
- `GET /api/instructor/batches`: List batches managed by the instructor.
- **Module/Chapter APIs**: Endpoints like `POST /api/courses/:courseId/modules`, `PUT /api/modules/:moduleId`, `POST /api/modules/:moduleId/chapters` to build curriculum.
- **Meetings**: Endpoints to manage and join interactive sessions (`/api/meetings` & `/api/meetings/batch/:batchId`).

### G. Admin APIs (`ADMIN_URL`, `AUTH_URL`, `COURSE_URL`)
Admins possess overarching CRUD capabilities across the platform:
- **Analytics**: `GET /api/admin/analytics` to view platform health.
- **User Management**:
  - `GET /api/admin/users`: List all users.
  - `POST /api/admin/users/create`, `PUT /api/admin/users/:id`, `DELETE /api/admin/users/:id`.
  - `PUT /api/admin/users/:id/status`: Suspend or activate users.
- **Role Scoping**: Lookups for specific roles via `GET /api/auth/students` and `GET /api/auth/instructors`.
- **Batch Management**:
  - `GET /api/batches`: View all study batches.
  - `PUT /api/batches/:batchId`, `PUT /api/batches/:batchId/status`, `DELETE /api/batches/:batchId`.
  - `POST /api/admin/batches/:batchId/assign-instructor`.
  - `GET /api/batches/:batchId/students` & `DELETE /api/batches/:batchId/students/:studentId`: Control batch enrollment rosters.
