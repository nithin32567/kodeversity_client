/**
 * useExamAttempt.ts
 * Manages local attempt state: current question index, answers map, flagging.
 * Calls saveAnswer API with 300ms debounce on every selection change.
 */
import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useSaveAnswerMutation, useGetAttemptQuery } from "@/presentation/features/exam/api/examApi";

export interface AnswerState {
  selectedOptionId?: string;
  isFlagged: boolean;
  saving?: "saving" | "saved" | "error";
}

interface UseExamAttemptOptions {
  attemptId: string;
  totalQuestions: number;
}

interface UseExamAttemptResult {
  attemptData: any;
  currentIndex: number;
  answers: Map<string, AnswerState>;
  selectOption: (questionId: string, optionId: string) => void;
  toggleFlag: (questionId: string) => void;
  clearAllFlags: () => Promise<void>;
  goTo: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  answeredCount: number;
  flaggedCount: number;
  unansweredCount: number;
}

export function useExamAttempt({
  attemptId,
  totalQuestions,
}: UseExamAttemptOptions): UseExamAttemptResult {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, AnswerState>>(new Map());
  const [saveAnswer] = useSaveAnswerMutation();
  const { data: attemptData } = useGetAttemptQuery(attemptId, { skip: !attemptId });
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (attemptData?.answers && attemptData.answers.length > 0) {
      setAnswers((prev) => {
        const next = new Map(prev);
        for (const ans of attemptData.answers!) {
          if (!next.has(ans.questionId)) {
            next.set(ans.questionId, {
              selectedOptionId: ans.selectedOptionId ?? undefined,
              isFlagged: ans.isFlagged ?? false,
              saving: "saved",
            });
          }
        }
        return next;
      });
    }
  }, [attemptData]);

  const debouncedSave = useCallback(
    (questionId: string, state: AnswerState) => {
      const existing = debounceTimers.current.get(questionId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(async () => {
        setAnswers((prev) => {
          const next = new Map(prev);
          next.set(questionId, { ...state, saving: "saving" });
          return next;
        });
        try {
          await saveAnswer({
            attemptId,
            questionId,
            selectedOptionId: state.selectedOptionId,
            isFlagged: state.isFlagged,
          }).unwrap();
          setAnswers((prev) => {
            const next = new Map(prev);
            const current = next.get(questionId);
            if (current) next.set(questionId, { ...current, saving: "saved" });
            return next;
          });
        } catch {
          setAnswers((prev) => {
            const next = new Map(prev);
            const current = next.get(questionId);
            if (current) next.set(questionId, { ...current, saving: "error" });
            return next;
          });
        }
        debounceTimers.current.delete(questionId);
      }, 300);

      debounceTimers.current.set(questionId, timer);
    },
    [attemptId, saveAnswer],
  );

  const selectOption = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        const existing = next.get(questionId) ?? { isFlagged: false };
        const updated: AnswerState = { ...existing, selectedOptionId: optionId };
        next.set(questionId, updated);
        debouncedSave(questionId, updated);
        return next;
      });
    },
    [debouncedSave],
  );

  const toggleFlag = useCallback(
    (questionId: string) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        const existing = next.get(questionId) ?? { isFlagged: false };
        const updated: AnswerState = { ...existing, isFlagged: !existing.isFlagged };
        next.set(questionId, updated);
        debouncedSave(questionId, updated);
        return next;
      });
    },
    [debouncedSave],
  );

  const clearAllFlags = useCallback(async () => {
    const flaggedEntries = [...answers.entries()].filter(([_, state]) => state.isFlagged);
    const promises = flaggedEntries.map(([questionId, state]) =>
      saveAnswer({
        attemptId,
        questionId,
        selectedOptionId: state.selectedOptionId,
        isFlagged: false,
      }).unwrap()
    );
    await Promise.allSettled(promises);
    setAnswers((prev) => {
      const next = new Map(prev);
      for (const [qId] of flaggedEntries) {
        const current = next.get(qId);
        if (current) {
          next.set(qId, { ...current, isFlagged: false });
        }
      }
      return next;
    });
  }, [answers, attemptId, saveAnswer]);

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalQuestions) setCurrentIndex(index);
    },
    [totalQuestions],
  );

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, totalQuestions - 1));
  }, [totalQuestions]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const answeredCount = useMemo(
    () => [...answers.values()].filter((a) => a.selectedOptionId).length,
    [answers],
  );

  const flaggedCount = useMemo(
    () => [...answers.values()].filter((a) => a.isFlagged).length,
    [answers],
  );

  const unansweredCount = totalQuestions - answeredCount;

  return {
    attemptData,
    currentIndex,
    answers,
    selectOption,
    toggleFlag,
    clearAllFlags,
    goTo,
    goNext,
    goPrev,
    answeredCount,
    flaggedCount,
    unansweredCount,
  };
}
