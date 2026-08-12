import { z } from "zod";
import { type QuestionDraft } from "./QuestionList";

export const setupSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  courseId: z.string().optional(),
  passMarks: z.number({ invalid_type_error: "Required" }).min(1, "Min 1 mark"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  scheduledStartDate: z.string().optional(),
  scheduledEndDate: z.string().optional(),
  minQuestionsToAttend: z.number().min(0, "Min 0").optional(),
  isSameMarkForAllQuestions: z.boolean(),
  marksPerQuestion: z.number().min(1, "Min 1 mark").optional(),
  durationMin: z.number({ invalid_type_error: "Required" }).min(1, "Min 1 min"),
  maxAttempts: z.number().min(1, "Min 1 attempt"),
});

export type SetupForm = z.infer<typeof setupSchema>;

export const STEPS = ["Exam Setup", "Question Builder", "Exam Settings", "Assign Students"] as const;

export function makeEmptyQuestion(): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    text: "",
    hint: "",
    timeLimit: 60,
    marks: 1,
    optional: false,
    options: [
      { id: crypto.randomUUID(), text: "", isCorrect: false },
      { id: crypto.randomUUID(), text: "", isCorrect: false },
    ],
    correctAnswerText: "",
  };
}
