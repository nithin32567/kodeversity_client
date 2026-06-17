// ---------------------------------------------------------------------------
// playground.ts — Domain types for the cloud-based Playground feature.
// This file is framework-agnostic: no React, no fetch, no infrastructure.
// ---------------------------------------------------------------------------

// ─── Playground Configuration (persisted on the Chapter entity) ─────────────

/**
 * Static configuration attached to a Chapter of type "PLAYGROUND".
 * Maps directly to the parameters the sandbox backend needs to
 * provision an isolated container environment.
 */
export interface PlaygroundConfig {
  /** Template group ID (maps to a ConfigDoc._id on the sandbox backend). */
  pg: string;
  /** Human-readable template name, uppercased (e.g. "UBUNTU2404"). */
  pgname: string;
  /** The playground template slug (e.g. "ubuntu2404n1"). */
  playground: string;
  /** Difficulty tier — drives XP multiplier. */
  difficulty: "easy" | "medium" | "hard" | "expert";
  /** Maximum score a student can earn on this playground lesson. */
  maxScore: number;
}

// ─── Lifecycle Phase (state machine) ────────────────────────────────────────

/**
 * Represents every phase the playground goes through, from initial
 * idle → provisioning → ready → tearing down → destroyed.
 */
export type PlaygroundLifecyclePhase =
  | "IDLE"
  | "GENERATING_ID"
  | "CREATING"
  | "POLLING"
  | "CONNECTING"
  | "READY"
  | "VALIDATING"
  | "SCORING"
  | "TEARING_DOWN"
  | "DESTROYED"
  | "ERROR";

// ─── Runtime Instance ───────────────────────────────────────────────────────

/**
 * Represents a live playground instance after the backend has
 * acknowledged the provisioning request (genID → createPG).
 */
export interface PlaygroundInstance {
  /** Unique instance identifier returned by the generate-id endpoint. */
  id: string;
  /** Current lifecycle phase. */
  phase: PlaygroundLifecyclePhase;
  /** Human-readable status message from the backend (e.g. "Booting…"). */
  statusMessage: string;
  /** Connection details, populated once the instance reaches READY. */
  connection: PlaygroundConnectionInfo | null;
  /** Epoch ms when the container was started (for countdown timer). */
  startTime: number | null;
  /** Backend-assigned post_name (used for code-server / desktop URLs). */
  postName: string | null;
  /** Error string if phase === "ERROR". */
  error: string | null;
}

// ─── Connection Info ────────────────────────────────────────────────────────

/**
 * IP/port data returned by the `get-ip/:id` endpoint.
 * Used to wire up terminal WebSocket connections and iframe URLs.
 */
export interface PlaygroundConnectionInfo {
  /** The IP addresses or hostnames of each VM in the playground. */
  ips: string[];
  /** Port mapping, keyed by service name (e.g. "terminal", "webview"). */
  ports: Record<string, number>;
  /** Raw response data for pass-through to terminal components. */
  raw: unknown;
}

// ─── Test Validation ────────────────────────────────────────────────────────

export interface TestResult {
  /** Human-readable message from the test runner. */
  message: string;
  /** Whether the test passed. */
  passed: boolean;
}

// ─── Scoring & XP ───────────────────────────────────────────────────────────

export interface ScorePayload {
  userId: string;
  from: "challenge" | "course" | "document" | "challenge-preview";
  fromId: string;
  type: string;
  taskName: string;
  score: number;
  input?: string;
  when: number;
}

export interface XpPayload {
  userId: string;
  from: string;
  fromId: string;
  xp: number;
  difficulty: string;
}

export interface ScoreResponse {
  message: string;
  success: boolean;
}

export interface XpResponse {
  message: string;
  success: boolean;
  /** Whether this is the first time the user completed this task. */
  isNew: boolean;
}

// ─── Template Configuration (mirrors sandbox ConfigDoc) ─────────────────────

/**
 * Mirrors the `ConfigDoc` type from the sandbox app (`src/types/pg.d.ts`).
 * Describes the full template configuration returned by the backend
 * when fetching `/api/v1/admin/template-config/:pgid`.
 */
export interface TemplateConfig {
  _id: string;
  name: string;
  image: string;
  description: string;
  keywords: string[];
  bridges: TemplateBridge[];
  templates: TemplateVM[];
}

export interface TemplateBridge {
  nat: boolean;
  bridge: string;
  "bridge-ip": string;
  network: string;
  nameservers: { ns1: string; ns2: string };
}

export interface TemplateVM {
  name: string;
  cpu: number;
  smt: boolean;
  multiplier: number;
  ram: number;
  "enable-overlay": boolean;
  "overlay-size": number;
  "is-zfs": boolean;
  "zfs-snapshot": string;
  "zfs-clone-path": string;
  "kernel-args": string;
  kernel: string;
  rootfs: string;
  username: string;
  "enable-gui": boolean;
  "gui-port": number;
  "enable-ide": boolean;
  "ide-port": number;
  "terminal-layout": string;
  disks: Array<{ name: string; size: number; "is-read-only": boolean }>;
  network: Array<{
    "is-primary": boolean;
    name: string;
    tap: string;
    bridge: string;
    ip: string;
    mask: number;
    gateway: string;
    mac: string;
    nameservers: { ns1: string; ns2: string };
  }>;
}
