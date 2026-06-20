export interface PlaygroundConfig {
  pg: string;
  pgname: string;
  playground: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  maxScore: number;
}

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

export interface PlaygroundInstance {
  id: string;
  phase: PlaygroundLifecyclePhase;
  statusMessage: string;
  connection: PlaygroundConnectionInfo | null;
  startTime: number | null;
  postName: string | null;
  error: string | null;
}

export interface PlaygroundConnectionInfo {
  ips: string[];
  ports: Record<string, number>;
  raw: unknown;
}

export interface TestResult {
  message: string;
  passed: boolean;
}

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
  isNew: boolean;
}

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
  "bridge-mask"?: number;
  network: string;
  nameservers: TemplateNameservers;
}

export interface TemplateNameservers {
  ns1: string;
  ns2: string;
}

export interface TemplateDisk {
  name: string;
  size: number;
  "is-read-only": boolean;
}

export interface TemplateNetwork {
  "is-primary": boolean;
  name: string;
  tap: string;
  bridge: string;
  ip: string;
  mask: number;
  gateway: string;
  mac: string;
  nameservers: TemplateNameservers;
}

export interface TemplateVM {
  name: string;
  cpu: number;
  smt: boolean;
  multiplier: number;
  ram: number;
  "enable-overlay": boolean;
  "overlay-size"?: number;
  "is-zfs": boolean;
  "zfs-snapshot"?: string;
  "zfs-clone-path"?: string;
  "kernel-args": string;
  kernel: string;
  rootfs?: string;
  username: string;
  "enable-gui": boolean;
  "gui-port"?: number;
  "enable-ide": boolean;
  "ide-port"?: number;
  "terminal-layout": string;
  disks: Array<TemplateDisk>;
  network: Array<TemplateNetwork>;
}
