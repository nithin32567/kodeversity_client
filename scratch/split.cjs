const fs = require('fs');
const path = require('path');

const src = 'src/presentation/features/admin-courses/components/CourseManagementDashboard.tsx';
const out = 'src/presentation/features/admin-courses/components/course-management';
const lines = fs.readFileSync(src, 'utf8').split('\n');

function getLines(start, end) { return lines.slice(start - 1, end).join('\n'); }

fs.mkdirSync(path.join(out, 'components'), { recursive: true });

const commonImports = `import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GripVertical, Plus, Trash2, Video, FileText, HelpCircle, BookOpen, Save, ChevronDown, Users, Edit3, X, Check, AlertCircle, ChevronsUpDown, ChevronsDownUp, Upload, TerminalSquare, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { User } from "@/domain/user";
import type { Course, Module, Chapter, ChapterType, CourseLevel, Instructor } from "@/domain/course";
import type { PlaygroundConfig } from "@/domain/playground";
`;

const types = commonImports + '\n' + getLines(42, 79) + '\n' + getLines(1883, 1892) + '\n' + `
export type { AddModuleForm, QuizQuestion, AddChapterForm, EnrolledStudentItem };
export interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  purchasedAt: string;
}
`;
fs.writeFileSync(path.join(out, 'types.ts'), types.replace(/interface /g, 'export interface '));

const utils = commonImports + '\n' + getLines(81, 93) + '\n' + getLines(103, 115);
fs.writeFileSync(path.join(out, 'utils.ts'), utils.replace(/const /g, 'export const ').replace(/function /g, 'export function '));

const ui = commonImports + `\nimport { LEVEL_OPTIONS, CHAPTER_TYPE_COLORS } from '../utils';\n` + getLines(95, 101) + '\n' + getLines(117, 191);
fs.writeFileSync(path.join(out, 'components', 'ui.tsx'), ui.replace(/function /g, 'export function '));

const addModule = commonImports + `\nimport { AddModuleForm } from '../types';\n` + getLines(193, 252);
fs.writeFileSync(path.join(out, 'components', 'AddModulePanel.tsx'), addModule.replace(/function /g, 'export function '));

const addChapter = commonImports + `\nimport { AddChapterForm, QuizQuestion } from '../types';\nimport { CHAPTER_TYPE_COLORS } from '../utils';\n` + getLines(254, 846);
fs.writeFileSync(path.join(out, 'components', 'AddChapterPanel.tsx'), addChapter.replace(/function /g, 'export function ').replace(/const PRESETS/, 'export const PRESETS'));

const editChapter = commonImports + `\nimport { AddChapterForm } from '../types';\nimport { CHAPTER_TYPE_COLORS } from '../utils';\n` + getLines(848, 1206);
fs.writeFileSync(path.join(out, 'components', 'EditChapterPanel.tsx'), editChapter.replace(/function /g, 'export function '));

const chapterRow = commonImports + `\nimport { AddChapterForm } from '../types';\nimport { CHAPTER_TYPE_COLORS } from '../utils';\nimport { ChapterIcon } from './ui';\nimport { EditChapterPanel } from './EditChapterPanel';\n` + getLines(1208, 1311);
fs.writeFileSync(path.join(out, 'components', 'ChapterRow.tsx'), chapterRow.replace(/function /g, 'export function '));

const moduleRow = commonImports + `\nimport { AddChapterForm } from '../types';\nimport { ChapterRow } from './ChapterRow';\nimport { AddChapterPanel } from './AddChapterPanel';\n` + getLines(1313, 1512);
fs.writeFileSync(path.join(out, 'components', 'ModuleRow.tsx'), moduleRow.replace(/function /g, 'export function '));

const curriculum = commonImports + `\nimport { AddModuleForm, AddChapterForm } from '../types';\nimport { SectionCard } from './ui';\nimport { ModuleRow } from './ModuleRow';\nimport { AddModulePanel } from './AddModulePanel';\n` + getLines(1514, 1657);
fs.writeFileSync(path.join(out, 'components', 'CurriculumPanel.tsx'), curriculum.replace(/function /g, 'export function '));

const instructorSel = commonImports + '\n' + getLines(1659, 1741);
fs.writeFileSync(path.join(out, 'components', 'SearchableInstructorSelect.tsx'), instructorSel.replace(/function /g, 'export function '));

const editDetails = commonImports + `\nimport { InputField } from './ui';\nimport { SearchableInstructorSelect } from './SearchableInstructorSelect';\nimport { LEVEL_OPTIONS } from '../utils';\n` + getLines(1743, 1881);
fs.writeFileSync(path.join(out, 'components', 'EditDetailsTab.tsx'), editDetails.replace(/function /g, 'export function '));

const enrolled = commonImports + '\n' + getLines(1894, 2098);
fs.writeFileSync(path.join(out, 'components', 'EnrolledStudentsTab.tsx'), enrolled.replace(/function /g, 'export function '));

const config = commonImports + `\nimport { SectionCard, TabButton } from './ui';\nimport { EditDetailsTab } from './EditDetailsTab';\nimport { EnrolledStudentsTab } from './EnrolledStudentsTab';\n` + getLines(2100, 2146);
fs.writeFileSync(path.join(out, 'components', 'ConfigPanel.tsx'), config.replace(/function /g, 'export function '));

const main = commonImports + `
import { useCourse } from "@/presentation/features/student-learning/hooks/useCourses";
import { useSuspendCourseMutation, useDeleteCourseMutation } from "@/features/admin/adminApi";
import { useConfirm } from "@/presentation/global/contexts/ConfirmContext";
import { CurriculumPanel } from './components/CurriculumPanel';
import { ConfigPanel } from './components/ConfigPanel';
import { handleModuleReorder, handleChapterReorder } from './utils';
import { LEVEL_OPTIONS } from './utils';
import { AddModuleForm, AddChapterForm } from './types';
` + getLines(2148, 2522);
fs.writeFileSync(path.join(out, 'index.tsx'), main);

console.log("Done splitting!");
