/**
 * examApi.ts
 * RTK Query slice for the Exam Service (VITE_EXAM_SERVICE_URL).
 * Covers: CRUD exams, student attempt flow (start → saveAnswer → submit → result).
 */
import { baseApi } from "@/services/api";

const BASE = (import.meta.env.VITE_EXAM_SERVICE_URL as string | undefined) ?? "http://localhost:4006";

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface ExamOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect?: boolean;
}

export interface ExamQuestion {
  id: string;
  text: string;
  type: "MCQ" | "QUIZZ";
  marks: number;
  optional?: boolean;
  hint?: string;
  timeLimit?: number;
  options: ExamOption[];
  correctAnswerText?: string;
}

export interface Exam {
  id: string;
  courseId?: string;
  title: string;
  description?: string;
  durationMin: number;
  totalMarks: number;
  passMarks: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  type?: "MCQ" | "LIVE_CODING" | "QUIZZ";
  isSameMarkForAllQuestions?: boolean;
  marksPerQuestion?: number;
  minQuestionsToAttend?: number;
  maxAttempts?: number;
  studentAttemptCount?: number;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  questions?: ExamQuestion[];
  examAssignments?: Array<{ studentId: string }>;
  attempts?: ExamAttempt[];
  createdAt: string;
  updatedAt: string;
  _count?: { questions: number; attempts: number };
}

export interface StudentAnswer {
  id: string;
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  isFlagged: boolean;
  isCorrect?: boolean | null;
  marksObtained?: number | null;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  score?: number;
  isPassed?: boolean | null;
  startedAt: string;
  submittedAt?: string;
  answers?: StudentAnswer[];
  exam?: Exam;
  questions?: ExamQuestion[];
}

export interface AttemptResult {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  totalMarks: number;
  passMarks: number;
  isPassed: boolean | null;
  startedAt: string;
  submittedAt: string;
  answers?: Array<{
    questionId: string;
    selectedOptionId?: string;
    textAnswer?: string;
    isFlagged: boolean;
    isCorrect?: boolean;
    question?: ExamQuestion;
  }>;
  exam?: Exam;
}

export interface CreateExamPayload {
  courseId?: string;
  title: string;
  description?: string;
  durationMin: number;
  totalMarks: number;
  passMarks: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  maxAttempts?: number;
  questions?: Array<{
    text: string;
    marks?: number;
    type?: string;
    correctAnswerText?: string;
    options: Array<{ text: string; isCorrect: boolean }>;
  }>;
}

export interface SaveAnswerPayload {
  attemptId: string;
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  isFlagged?: boolean;
}

export interface EvaluateAttemptPayload {
  attemptId: string;
  evaluations: Array<{
    answerId: string;
    isCorrect: boolean;
    marksObtained: number;
  }>;
}

// ─── Slice ────────────────────────────────────────────────────────────────────

export const examApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExamsByCourse: build.query<Exam[], string>({
      query: (courseId) => ({ url: `${BASE}/api/exams/course/${courseId}` }),
      providesTags: ["Exams"],
    }),

    getExamDetails: build.query<Exam, string>({
      query: (examId) => ({ url: `${BASE}/api/exams/${examId}/details` }),
      providesTags: ["Exams"],
    }),

    createExam: build.mutation<Exam, CreateExamPayload>({
      query: (payload) => ({
        url: `${BASE}/api/exams`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Exams"],
    }),

    assignExam: build.mutation<void, { examId: string; studentIds: string[]; scheduledAt?: string; dueAt?: string }>({
      query: ({ examId, ...body }) => ({
        url: `${BASE}/api/exams/${examId}/assign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Exams"],
    }),

    updateExam: build.mutation<Exam, { id: string } & Partial<CreateExamPayload>>({
      query: ({ id, ...patch }) => ({
        url: `${BASE}/api/exams/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["Exams"],
    }),

    deleteExam: build.mutation<void, string>({
      query: (id) => ({
        url: `${BASE}/api/exams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Exams"],
    }),

    startExam: build.mutation<ExamAttempt, string>({
      query: (examId) => ({
        url: `${BASE}/api/exams/${examId}/start`,
        method: "POST",
      }),
    }),

    saveAnswer: build.mutation<StudentAnswer, SaveAnswerPayload>({
      query: ({ attemptId, ...body }) => ({
        url: `${BASE}/api/exams/attempts/${attemptId}/answers`,
        method: "PUT",
        body,
      }),
    }),

    submitAttempt: build.mutation<AttemptResult, string>({
      query: (attemptId) => ({
        url: `${BASE}/api/exams/attempts/${attemptId}/submit`,
        method: "POST",
      }),
      invalidatesTags: ["Exams"],
    }),

    getAttemptResult: build.query<AttemptResult, string>({
      query: (attemptId) => ({ url: `${BASE}/api/exams/attempts/${attemptId}/result` }),
      providesTags: ["Exams"],
    }),

    getAttempt: build.query<ExamAttempt, string>({
      query: (attemptId) => ({ url: `${BASE}/api/exams/attempts/${attemptId}` }),
      providesTags: ["Exams"],
    }),

    evaluateAttempt: build.mutation<ExamAttempt, EvaluateAttemptPayload>({
      query: ({ attemptId, evaluations }) => ({
        url: `${BASE}/api/exams/attempts/${attemptId}/evaluate`,
        method: "PUT",
        body: { evaluations },
      }),
      invalidatesTags: ["Exams"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExamsByCourseQuery,
  useGetExamDetailsQuery,
  useCreateExamMutation,
  useAssignExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useStartExamMutation,
  useSaveAnswerMutation,
  useSubmitAttemptMutation,
  useGetAttemptResultQuery,
  useGetAttemptQuery,
  useEvaluateAttemptMutation,
} = examApi;
