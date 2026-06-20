export { PlaygroundWorkspace } from "./components/PlaygroundWorkspace";
export { PlaygroundStatusOverlay } from "./components/PlaygroundStatusOverlay";
export { PlaygroundHeader } from "./components/PlaygroundHeader";
export { TerminalPanel } from "./components/TerminalPanel";
export { CodeEditorPanel } from "./components/CodeEditorPanel";

export { usePlaygroundSession } from "./hooks/usePlaygroundSession";
export type {
  UsePlaygroundSessionReturn,
  PlaygroundSessionPhase,
  PlaygroundSessionState,
} from "./hooks/usePlaygroundSession";

export { usePlaygroundLifecycle } from "./hooks/usePlaygroundLifecycle";
export type { UsePlaygroundLifecycleReturn } from "./hooks/usePlaygroundLifecycle";

export { playgroundApi } from "./api";

export { TerminalWebSocket } from "@/infrastructure/playground/terminalWebSocket";
export type {
  TerminalWebSocketOptions,
  DataCallback,
} from "@/infrastructure/playground/terminalWebSocket";

export type {
  PlaygroundConfig,
  PlaygroundInstance,
  PlaygroundLifecyclePhase,
  PlaygroundConnectionInfo,
  TemplateConfig,
  TemplateVM,
  TestResult,
  ScorePayload,
  XpPayload,
  ScoreResponse,
  XpResponse,
} from "@/domain/playground";
