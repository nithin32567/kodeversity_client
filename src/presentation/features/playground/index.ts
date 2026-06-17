/**
 * Playground feature module — public API.
 *
 * Import from this barrel to use any playground-related component or hook:
 *   import { PlaygroundWorkspace, usePlaygroundLifecycle } from "@/presentation/features/playground";
 */

// Components
export { PlaygroundWorkspace } from "./components/PlaygroundWorkspace";
export { PlaygroundStatusOverlay } from "./components/PlaygroundStatusOverlay";

// Hooks
export { usePlaygroundLifecycle } from "./hooks/usePlaygroundLifecycle";
export type { UsePlaygroundLifecycleReturn } from "./hooks/usePlaygroundLifecycle";

// API layer
export { playgroundApi } from "./api";

// Types (re-exported from domain for convenience)
export type {
  PlaygroundConfig,
  PlaygroundInstance,
  PlaygroundLifecyclePhase,
  PlaygroundConnectionInfo,
  TemplateConfig,
  TestResult,
  ScorePayload,
  XpPayload,
} from "@/domain/playground";
