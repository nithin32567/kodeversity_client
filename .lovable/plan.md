## Goal

Reorganize the codebase into a strict Clean Architecture without touching any visual design, base components, or styling. All authenticated users are students. Routing stays on TanStack Router (file-based) as you confirmed; references to `react-router-dom` in your brief are interpreted as "the project's router" and `<Outlet />` is provided by `@tanstack/react-router`.

## New folder structure

```text
src/
  domain/
    user.ts                 // User, Session, AuthTokens types
    course.ts               // Course, Lesson, Challenge types (moved from components/courses/data.ts types)
    index.ts
  infrastructure/
    http/
      apiClient.ts          // fetch wrapper, withCredentials, in-memory access token getter/setter, 401 -> refresh
      endpoints.ts
    auth/
      authService.ts        // login, logout, refresh, me — calls apiClient
  presentation/
    contexts/
      AuthContext.tsx       // in-memory accessToken state, user, login/logout, bootstraps via refresh on mount
    layouts/
      StudentLayout.tsx     // wraps AppShell + <Outlet />
    pages/                  // thin route components re-exported by src/routes/*
      HomePage.tsx
      CoursesPage.tsx
      CourseDetailPage.tsx
      LearnPage.tsx
      PlaygroundPage.tsx
      ChallengesPage.tsx
      DashboardPage.tsx
      CommunityPage.tsx
      RoadmapsPage.tsx
      PracticePage.tsx
      MentorshipPage.tsx
      CertificatesPage.tsx
      EventsPage.tsx
      SettingsPage.tsx
      LoginPage.tsx
    components/             // moved from src/components/** (AppShell, hero/, courses/, challenges/, learning/, ui/, footer/, animations/)
  routes/                   // TanStack file-based routes — thin wrappers only
    __root.tsx              // mounts QueryClientProvider + AuthProvider + SmoothScroll
    _authenticated.tsx      // pathless layout: beforeLoad gate + StudentLayout
    _authenticated/
      dashboard.tsx
      challenges.tsx
      certificates.tsx
      settings.tsx
      learn.$slug.tsx
      playground.$slug.tsx
    index.tsx               // public marketing home
    login.tsx               // public
    courses.index.tsx       // public catalog
    courses.$slug.tsx       // public detail
    community.tsx
    roadmaps.tsx
    practice.tsx
    mentorship.tsx
    events.tsx
  routeTree.gen.ts          // regenerated automatically — do not edit
  router.tsx                // unchanged scroll behavior
  styles.css                // unchanged
```

`src/components/`, `src/hooks/`, `src/lib/` are migrated under `src/presentation/` (components/hooks) and `src/infrastructure/` or `src/domain/` (lib utilities split by purpose). `useAccent`, `useMouseField`, `utils` stay presentation. `error-capture`, `error-page` stay presentation. Import paths updated project-wide; `@/components/*` → `@/presentation/components/*` etc. The `@/` alias keeps working.

## Auth handling

- `AuthContext` holds `{ user, accessToken }` in React state only — no localStorage, no cookies touched from JS.
- `apiClient` is a fetch wrapper with `credentials: 'include'` (equivalent of axios `withCredentials: true`) and an `Authorization: Bearer <accessToken>` header read from an in-memory ref set by `AuthContext`.
- On 401, `apiClient` calls `POST /auth/refresh` once (relies on HttpOnly refresh cookie), updates the in-memory token, and retries the original request.
- On app mount, `AuthContext` calls `/auth/refresh` then `/auth/me` to rehydrate after reload.
- Base URL from `VITE_API_BASE_URL` (empty string default → same-origin).
- `login(email, password)` → `POST /auth/login` → sets in-memory token + user. `logout()` → `POST /auth/logout` → clears state.

## Routing & layout

- `_authenticated.tsx` pathless layout: `beforeLoad` reads `context.auth`; if not authenticated, `throw redirect({ to: '/login', search: { redirect: location.href } })`. Component renders `<StudentLayout><Outlet /></StudentLayout>`.
- `StudentLayout` wraps the existing `AppShell` (variant logic kept) so the visual sidebar/header don't change.
- Router context extended with `{ auth }`; `__root.tsx` passes the live `AuthContext` value into the router via `RouterProvider` context override so `beforeLoad` sees current state.
- `login.tsx` redirects authenticated users to `search.redirect ?? '/dashboard'`.
- Public routes: `/`, `/login`, `/courses`, `/courses/$slug`, marketing pages (`/community`, `/roadmaps`, `/practice`, `/mentorship`, `/events`).
- Protected (student-only) routes: `/dashboard`, `/settings`, `/challenges`, `/certificates`, `/learn/$slug`, `/playground/$slug`.

## What stays untouched

- All visual output: `AppShell`, `Hero`, `CoursesSection`, `ChallengesSection`, `LearningSection`, every `ui/*` primitive, `styles.css`, accent system, smooth scroll.
- TanStack Router config, scroll restoration, route preloading.
- Generated `routeTree.gen.ts` regenerates from new route files automatically.

## Admin removal

Per your note this is student-view only. No admin code is currently present — confirmed by directory scan. No deletions needed beyond ensuring no "admin variant" branches exist in `AppShell` (already only `default | learn` variants, both student-facing).

## Out of scope

- No new visual design, no styling refactor, no base-component logic changes.
- No Supabase / Lovable Cloud enablement — auth talks to your external API via `VITE_API_BASE_URL`.
- No migration to `react-router-dom`.

## Verification

After refactor: build passes, every existing page renders identically, `/dashboard` redirects to `/login` when unauthenticated, login round-trip stores token in memory only (verifiable via `localStorage` being empty in devtools).
