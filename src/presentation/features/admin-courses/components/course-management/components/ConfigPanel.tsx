import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2, Video, FileText, HelpCircle, BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle, ChevronsUpDown, ChevronsDownUp, Upload, TerminalSquare, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { User } from "@/domain/user";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";

import { SectionCard, TabButton } from './ui';
import { EditDetailsTab } from './EditDetailsTab';
import { EnrolledStudentsTab } from './EnrolledStudentsTab';
export function ConfigPanel({
  course,
  instructors,
  students,
  onSaveInstructor,
  refetchCourse,
}: {
  course: Course;
  instructors: Instructor[];
  students: User[];
  onSaveInstructor: (instructorId: string | null) => Promise<void>;
  refetchCourse: () => void;
}) {
  const [tab, setTab] = useState<"details" | "students">("details");

  return (
    <SectionCard>
      <div className="flex gap-6 px-5 border-b border-[var(--hairline)]">
        <TabButton
          label="Edit Details & Instructor"
          active={tab === "details"}
          onClick={() => setTab("details")}
        />
        <TabButton
          label={`Enrolled Students (${course.totalStudents})`}
          active={tab === "students"}
          onClick={() => setTab("students")}
        />
      </div>

      {tab === "details" && (
        <EditDetailsTab
          course={course}
          instructors={instructors}
          onSaveInstructor={onSaveInstructor}
        />
      )}
      {tab === "students" && (
        <EnrolledStudentsTab
          courseId={course.id}
          allStudents={students}
          onEnrollSuccess={refetchCourse}
        />
      )}
    </SectionCard>
  );
}