export type Level = "Beginner" | "Associate" | "Professional";

export interface Course {
  title: string;
  level: Level;
  hours: string;
  description: string;
  instructor: string;
  certificationPrep?: boolean;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const topCourses: Course[] = [
  {
    title: "Certified Jenkins Engineer",
    level: "Associate",
    hours: "19.98",
    description:
      "Prepare for Jenkins Engineer certification: SCM and CI/CD, architecture, JVM tuning, plugins, NodeJS/SonarQube, monitoring...",
    instructor: "Barahalikar Siddharth",
    certificationPrep: true,
  },
  {
    title: "Rust Programming",
    level: "Associate",
    hours: "13.60",
    description:
      "Master Rust programming from basics to advanced concepts including ownership, concurrency, async programming,...",
    instructor: "Priyanka Yadav",
  },
];

export const careerTracks: Course[] = [
  {
    title: "DevOps Engineer Track",
    level: "Professional",
    hours: "82.50",
    description:
      "End-to-end DevOps track: Linux, Git, Docker, Kubernetes, Terraform, Ansible, CI/CD, observability, SRE practices.",
    instructor: "Mumshad Mannambeth",
  },
  {
    title: "Cloud Architect Track",
    level: "Professional",
    hours: "64.20",
    description:
      "Become a multi-cloud architect across AWS, Azure, and GCP. Design networks, identity, storage, and resilient workloads.",
    instructor: "Michael Forrester",
  },
];

export const learningPaths: Course[] = [
  {
    title: "Kubernetes from Zero to Hero",
    level: "Beginner",
    hours: "28.40",
    description:
      "Hands-on Kubernetes path: pods, deployments, services, ingress, RBAC, storage, Helm, and production patterns.",
    instructor: "Mumshad Mannambeth",
  },
  {
    title: "AI Engineering Foundations",
    level: "Beginner",
    hours: "22.10",
    description:
      "From prompts to production: LLM APIs, RAG, vector stores, evals, agents, and shipping AI features safely.",
    instructor: "Gav Ridgeway",
  },
];

export const certifications: Course[] = [
  {
    title: "AWS Solutions Architect Associate Certification",
    level: "Associate",
    hours: "48.00",
    description:
      "Prepare for AWS Solutions Architect Associate exam with scalable designs across compute, storage, networking, security, and well...",
    instructor: "Michael Forrester",
    certificationPrep: true,
  },
  {
    title: "Certified Kubernetes Security Specialist (CKS)",
    level: "Professional",
    hours: "08.75",
    description:
      "Prepare for CKS certification: Implement comprehensive security practices for cloud-native applications on Kubernetes, including...",
    instructor: "Mumshad Mannambeth",
    certificationPrep: true,
  },
];

export const tabs = [
  { id: "top", label: "Top Courses", data: topCourses },
  { id: "tracks", label: "Career Tracks", data: careerTracks },
  { id: "paths", label: "Learning Paths", data: learningPaths },
  { id: "certs", label: "Certifications", data: certifications },
] as const;

export const allCourses: Course[] = [
  ...topCourses,
  ...careerTracks,
  ...learningPaths,
  ...certifications,
];

export function findCourseBySlug(slug: string): Course | undefined {
  return allCourses.find((c) => slugify(c.title) === slug);
}
