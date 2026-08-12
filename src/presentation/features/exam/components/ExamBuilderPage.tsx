import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ClipboardCheck } from "lucide-react";
import { useCreateExamMutation, useUpdateExamMutation, useGetExamDetailsQuery } from "@/presentation/features/exam/api/examApi";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";

import { StudentAssignPanel, type StudentAssignPanelRef } from "./StudentAssignPanel";
import { type QuestionDraft } from "./QuestionList";

import { setupSchema, type SetupForm, makeEmptyQuestion } from "./examBuilderConstants";
import { StepIndicator } from "./StepIndicator";
import { ExamSetupStep } from "./ExamSetupStep";
import { ExamQuestionBuilderStep } from "./ExamQuestionBuilderStep";
import { ExamSettingsStep } from "./ExamSettingsStep";
import { ExamBuilderFooter } from "./ExamBuilderFooter";
import { type ExamType } from "./ExamTypeSelector";

export function ExamBuilderPage() {
  const { examId } = useParams<{ examId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!examId;

  const savedState = useMemo(() => {
    try {
      const saved = sessionStorage.getItem(`exam_builder_${examId || "new"}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [examId]);

  const [step, setStep] = useState<number>(savedState?.step ?? 0);
  const [examType, setExamType] = useState<ExamType>(savedState?.examType ?? "MCQ");
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    savedState?.questions ?? [makeEmptyQuestion()]
  );
  const [selectedQIndex, setSelectedQIndex] = useState<number>(savedState?.selectedQIndex ?? 0);
  const [createdExamId, setCreatedExamId] = useState<string | undefined>(
    savedState?.createdExamId ?? examId
  );
  const [hasInitializedFromApi, setHasInitializedFromApi] = useState(false);

  const assignPanelRef = useRef<StudentAssignPanelRef>(null);

  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();
  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();
  const isSubmitting = isCreating || isUpdating;

  const { data: existingExam, isLoading: isFetchingExam } = useGetExamDetailsQuery(createdExamId ?? "", {
    skip: !createdExamId,
  });

  const form: UseFormReturn<SetupForm> = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: savedState?.formValues ?? {
      title: "",
      description: "",
      passMarks: 50,
      minQuestionsToAttend: 0,
      status: "DRAFT",
      isSameMarkForAllQuestions: false,
      marksPerQuestion: 1,
      durationMin: 60,
      maxAttempts: 1,
    },
    mode: "onChange",
  });

  const { handleSubmit, watch, formState: { isValid } } = form;
  const allFormValues = watch();

  const isSameMark = watch("isSameMarkForAllQuestions");
  const marksPerQuestion = watch("marksPerQuestion") || 1;

  useEffect(() => {
    if (isEditing && existingExam && !hasInitializedFromApi && !savedState) {
      form.reset({
        title: existingExam.title,
        description: existingExam.description || "",
        passMarks: existingExam.passMarks,
        minQuestionsToAttend: existingExam.minQuestionsToAttend || 0,
        status: existingExam.status === "ARCHIVED" ? "DRAFT" : existingExam.status,
        isSameMarkForAllQuestions: existingExam.isSameMarkForAllQuestions || false,
        marksPerQuestion: existingExam.marksPerQuestion || 1,
        durationMin: existingExam.durationMin,
        maxAttempts: existingExam.maxAttempts || 1,
        scheduledStartDate: existingExam.scheduledStartDate || undefined,
        scheduledEndDate: existingExam.scheduledEndDate || undefined,
      });

      if (existingExam.questions && existingExam.questions.length > 0) {
        setQuestions(
          existingExam.questions.map((q) => ({
            id: q.id,
            text: q.text,
            hint: q.hint || "",
            timeLimit: q.timeLimit || 60,
            marks: q.marks,
            optional: q.optional || false,
            options: q.options ? q.options.map((o: any) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect || false })) : [],
            correctAnswerText: q.correctAnswerText || "",
          }))
        );
      }
      setHasInitializedFromApi(true);
    }
  }, [existingExam, hasInitializedFromApi, savedState, isEditing, form]);

  useEffect(() => {
    sessionStorage.setItem(
      `exam_builder_${examId || "new"}`,
      JSON.stringify({
        step,
        examType,
        questions,
        selectedQIndex,
        createdExamId,
        formValues: allFormValues,
      })
    );
  }, [step, examType, questions, selectedQIndex, createdExamId, allFormValues, examId]);

  const calculatedTotal = isSameMark
    ? questions.length * marksPerQuestion
    : questions.reduce((s, q) => s + (q.marks || 0), 0);

  // Question management methods
  const handleAddQuestion = useCallback(() => {
    setQuestions((prev) => [...prev, makeEmptyQuestion()]);
    setSelectedQIndex(questions.length);
  }, [questions.length]);

  const handleDeleteQuestion = useCallback((index: number) => {
    setQuestions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [makeEmptyQuestion()] : next;
    });
    setSelectedQIndex((prev) => Math.max(0, Math.min(prev, questions.length - 2)));
  }, [questions.length]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setQuestions((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setSelectedQIndex(index - 1);
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setQuestions((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setSelectedQIndex(index + 1);
  }, []);

  const handleQuestionChange = useCallback((updated: QuestionDraft) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  }, []);

  const validateStep2 = () => {
    const complete = questions.some((q) => {
      if (examType === "QUIZZ") {
        return q.text.trim().length > 0;
      }
      return (
        q.text.trim() &&
        q.options.length >= 2 &&
        q.options.some((o) => o.isCorrect) &&
        q.options.every((o) => o.text.trim())
      );
    });
    if (!complete) {
      toast.error(
        examType === "QUIZZ" 
          ? "Add at least one complete question with question text." 
          : "Add at least one complete question with a marked correct answer."
      );
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (step === 0) {
      const isOk = await form.trigger(["title", "description"]);
      if (isOk) setStep(1);
    } else if (step === 1) {
      if (validateStep2()) setStep(2);
    }
  };

  const getPayload = (data: SetupForm, statusOverride?: "DRAFT") => ({
    ...data,
    ...(statusOverride ? { status: statusOverride } : {}),
    totalMarks: calculatedTotal,
    durationMin: data.durationMin,
    type: examType,
    isSameMarkForAllQuestions: data.isSameMarkForAllQuestions,
    marksPerQuestion: data.marksPerQuestion,
    questions: step >= 1 || !statusOverride ? questions.map((q) => ({
      text: q.text,
      hint: q.hint,
      timeLimit: q.timeLimit,
      marks: data.isSameMarkForAllQuestions ? (data.marksPerQuestion || 1) : q.marks,
      optional: q.optional || false,
      type: examType === "QUIZZ" ? "QUIZZ" : "MCQ",
      options: examType === "QUIZZ" ? [] : q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
      correctAnswerText: examType === "QUIZZ" ? q.correctAnswerText : undefined,
    })) : undefined,
  });

  const onFinalSubmit = handleSubmit(async (data: SetupForm) => {
    if (data.passMarks > calculatedTotal) {
      toast.error(`Pass marks cannot exceed total marks (${calculatedTotal})`);
      return;
    }
    if (data.minQuestionsToAttend !== undefined && data.minQuestionsToAttend > questions.length) {
      toast.error(`Min questions to attend cannot exceed total questions (${questions.length})`);
      return;
    }
    try {
      const payload = getPayload(data);
      if (isEditing && createdExamId) {
        await updateExam({ id: createdExamId, ...payload }).unwrap();
        toast.success("Exam updated successfully!");
      } else {
        const created = await createExam(payload).unwrap();
        setCreatedExamId(created.id);
        toast.success("Exam created successfully!");
      }
      setStep(3);
    } catch {
      toast.error("Failed to save exam. Please try again.");
    }
  });

  const role = user?.role === "ADMIN" ? "admin" : "instructor";

  const handleBack = () => {
    if (step === 0) {
      sessionStorage.removeItem(`exam_builder_${examId || "new"}`);
      navigate(`/${role}/exams`);
    } else {
      setStep((s) => s - 1);
    }
  };

  const handleSaveDraft = handleSubmit(async (data: SetupForm) => {
    try {
      const payload = getPayload(data, "DRAFT");
      if (isEditing && createdExamId) {
        await updateExam({ id: createdExamId, ...payload }).unwrap();
      } else {
        const created = await createExam(payload).unwrap();
        setCreatedExamId(created.id);
      }
      toast.success("Draft saved successfully!");
    } catch {
      toast.error("Failed to save draft.");
    }
  });

  const handleFinish = async () => {
    if (assignPanelRef.current?.hasSelected) {
      try {
        await assignPanelRef.current.assignSelected();
      } catch {
        return;
      }
    }
    toast.success("Exam setup completed successfully!");
    sessionStorage.removeItem(`exam_builder_${examId || "new"}`);
    navigate(`/${role}/exams`);
  };

  return (
    <main className="flex-1 px-4 pb-8 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full space-y-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-b border-border pb-5">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight md:text-3xl font-display">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
              <ClipboardCheck className="h-5 w-5 text-[var(--primary)]" />
            </div>
            {isEditing ? "Edit Exam" : "Create New Exam"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isEditing ? "Modify the exam and its questions." : "Set up your exam, add MCQ questions, configure settings, then assign to students."}
          </p>
        </div>
        {(step === 1 || step === 2) && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">Total Marks:</span>
            <span className="font-display font-bold text-[var(--primary)] text-lg">
              {calculatedTotal}
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto pb-1">
        <StepIndicator currentStep={step} />
      </div>

      {isFetchingExam ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : (
        <>
          {step === 0 && <ExamSetupStep form={form} examType={examType} setExamType={setExamType} />}

          {step === 1 && (
            <ExamQuestionBuilderStep
              questions={questions}
              examType={examType}
              selectedQIndex={selectedQIndex}
              isSameMark={isSameMark}
              setSelectedQIndex={setSelectedQIndex}
              handleAddQuestion={handleAddQuestion}
              handleDeleteQuestion={handleDeleteQuestion}
              handleMoveUp={handleMoveUp}
              handleMoveDown={handleMoveDown}
              handleQuestionChange={handleQuestionChange}
            />
          )}

          {step === 2 && <ExamSettingsStep form={form} calculatedTotal={calculatedTotal} totalQuestions={questions.length} />}

          {step === 3 && (
            <StudentAssignPanel 
              ref={assignPanelRef} 
              examId={createdExamId} 
              initialAssignedIds={existingExam?.examAssignments?.map(a => a.studentId)}
            />
          )}
        </>
      )}

      <ExamBuilderFooter
        step={step}
        totalSteps={4}
        isSubmitting={isSubmitting}
        isValid={isValid}
        isEditing={isEditing}
        onBack={handleBack}
        onSaveDraft={handleSaveDraft}
        onNext={handleNext}
        onCreateOrUpdate={() => {
          void onFinalSubmit();
        }}
        onFinish={handleFinish}
      />
    </main>
  );
}
