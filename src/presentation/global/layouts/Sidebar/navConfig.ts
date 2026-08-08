import {
  BookOpen,
  Users,
  GraduationCap,
  ClipboardList,
  ClipboardCheck,
  Award,
  Video,
  UserCog,
  Settings,
  Layers,
  PenTool,
  ShieldOff,
  Terminal,
  Archive,
  Inbox,
  LayoutDashboard,
} from "lucide-react";
import { NavItem } from "./types";

export const adminManage: NavItem[] = [
  { label: "Courses", icon: BookOpen, to: "/admin/courses" },
  { label: "Exams", icon: ClipboardCheck, to: "/admin/exams" },
  { label: "Playgrounds", icon: Terminal, to: "/admin/playground" },
  { label: "Students", icon: Users, to: "/admin/students" },
  { label: "Instructors", icon: GraduationCap, to: "/admin/instructors" },
  { label: "Batches", icon: Layers, to: "/admin/batches" },
  { label: "Unlock Requests", icon: Inbox, to: "/admin/unlock-requests" },
  { label: "Enrollments", icon: ClipboardList, to: "/admin/enrollments" },
];
export const adminContent: NavItem[] = [
  { label: "Live Classes", icon: Video, to: "/admin/live-classes" },
];
export const adminSystem: NavItem[] = [
  { label: "Inactive Users", icon: ShieldOff, to: "/admin/inactive-users" },
  { label: "Inactive Courses", icon: Archive, to: "/admin/archive" },
];

export const instructorContent: NavItem[] = [
  { label: "My Courses", icon: BookOpen, to: "/instructor/courses" },
  { label: "Exams", icon: ClipboardCheck, to: "/instructor/exams" },
  { label: "My Batches", icon: Layers, to: "/instructor/batches" },
  { label: "Live Classes", icon: Video, to: "/instructor/meetings" },
  { label: "Unlock Requests", icon: Inbox, to: "/instructor/unlock-requests" },
];

export const studentWorkspace: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/student/dashboard" },
  // { label: "All Courses", icon: BookOpen, to: "/student/courses" },  
  { label: "Exams", icon: ClipboardCheck, to: "/student/exams" },
  { label: "My Batches", icon: Layers, to: "/student/batches" },
  { label: "Live Classes", icon: Video, to: "/student/live-classes" },
  { label: "Profile", icon: UserCog, to: "/student/profile" },
];
export const studentSandbox: NavItem[] = [
  { label: "Challenges", icon: PenTool, to: "/student/challenges" },
  { label: "Certificates", icon: Award, to: "/student/certificates" },
  { label: "Settings", icon: Settings, to: "/student/settings" },
];
