import {
  Boxes,
  Container,
  Infinity as InfinityIcon,
  GitBranch,
  Sparkles,
  Cloud,
  Terminal,
  Code2,
  Cpu,
  KeyRound,
  GitMerge,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type MenuItem = {
  label: string;
  sub: string;
  icon: LucideIcon;
  tint: string;
};

export const labsPopular: MenuItem[] = [
  {
    label: "Kubernetes",
    sub: "Deploy & Scale Applications",
    icon: Boxes,
    tint: "var(--accent-cyan)",
  },
  {
    label: "Artificial Intelligence",
    sub: "Build with LLMs & AI Frameworks",
    icon: Sparkles,
    tint: "var(--accent-violet)",
  },
  { label: "Docker", sub: "Build & Run Containerized Apps", icon: Container, tint: "#2496ED" },
  {
    label: "Terraform",
    sub: "Write & Deploy Infrastructure as Code",
    icon: Workflow,
    tint: "#7B42BC",
  },
  {
    label: "DevOps",
    sub: "Master Foundation Skills",
    icon: InfinityIcon,
    tint: "var(--accent-cyan)",
  },
  {
    label: "Linux",
    sub: "Practice Linux Administration & Scripting",
    icon: Terminal,
    tint: "var(--accent-amber)",
  },
  { label: "Git", sub: "Master Version Control & Collaboration", icon: GitBranch, tint: "#F05033" },
  {
    label: "Python Programming",
    sub: "Master Python for DevOps & Automation",
    icon: Code2,
    tint: "#FFD43B",
  },
];

export const playgroundsPopular: MenuItem[] = [
  { label: "AWS", sub: "Launch Real AWS Services", icon: Cloud, tint: "var(--accent-amber)" },
  {
    label: "Claude Code",
    sub: "Build with Instant Claude Access",
    icon: Sparkles,
    tint: "#E8A87C",
  },
  {
    label: "KodeKey",
    sub: "Explore All-in-one AI Access",
    icon: KeyRound,
    tint: "var(--accent-cyan)",
  },
  {
    label: "CI/CD",
    sub: "Experiment With Automated Pipelines",
    icon: GitMerge,
    tint: "var(--accent-violet)",
  },
];

export const playgroundsCategory: MenuItem[] = [
  {
    label: "Artificial Intelligence",
    sub: "Experiment with LLMs & Prompts",
    icon: Sparkles,
    tint: "var(--accent-violet)",
  },
  {
    label: "Cloud",
    sub: "Experiment with LLMs & Prompts",
    icon: Cloud,
    tint: "var(--accent-cyan)",
  },
  {
    label: "Linux",
    sub: "Practice Linux Without Installation",
    icon: Terminal,
    tint: "var(--accent-amber)",
  },
  {
    label: "Kubernetes",
    sub: "Deploy Multi-Cluster Environments",
    icon: Cpu,
    tint: "var(--accent-cyan)",
  },
];
