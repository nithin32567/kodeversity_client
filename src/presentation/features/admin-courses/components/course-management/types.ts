import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2, Video, FileText, HelpCircle, BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle, ChevronsUpDown, ChevronsDownUp, Upload, TerminalSquare, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { User } from "@/domain/user";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";

export interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  purchasedAt: string;
}

export interface AddModuleForm {
  title: string;
  description?: string;
  sortOrder?: number;
}
export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface AddChapterForm {
  title: string;
  description?: string;
  type: ChapterType;
  sortOrder?: number;
  videoUrl?: string | null;
  duration?: number | null;
  documentUrl?: string | null;
  playgroundConfig?: PlaygroundConfig | null;
  quizzes?:
    | {
        title: string;
        questions: {
          questionText: string;
          options: string[];
          correctAnswer: string;
        }[];
      }[]
    | null;
}
export interface EnrolledStudentItem {
  id: string;
  studentId: string;
  purchasedAt: string;
  student?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
}


