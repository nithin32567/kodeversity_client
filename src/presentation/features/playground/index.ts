export { PlaygroundWorkspace } from "./components/PlaygroundWorkspace";
export { ChallengesSection } from "./components/ChallengesSection";


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
