import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Save } from "lucide-react";
import { useGetExamDetailsQuery, useEvaluateAttemptMutation } from "@/presentation/features/exam/api/examApi";

interface Props {
  examId: string;
  onBack: () => void;
}

export function InstructorExamDetails({ examId, onBack }: Props) {
  const { data: exam, isLoading, isError } = useGetExamDetailsQuery(examId);
  const [evaluateAttempt] = useEvaluateAttemptMutation();
  const [activeTab, setActiveTab] = useState<"questions" | "submissions">("questions");

  const [evaluatingAttemptId, setEvaluatingAttemptId] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<Record<string, { isCorrect: boolean; marksObtained: number }>>({});

  const handleStartEvaluation = (attemptId: string) => {
    setEvaluatingAttemptId(attemptId);
    setEvaluations({});
  };

  const handleEvaluationChange = (answerId: string, isCorrect: boolean, maxMarks: number) => {
    setEvaluations(prev => ({
      ...prev,
      [answerId]: {
        isCorrect,
        marksObtained: isCorrect ? maxMarks : 0
      }
    }));
  };

  const handleSaveEvaluation = async (attemptId: string) => {
    const payload = Object.entries(evaluations).map(([answerId, ev]) => ({
      answerId,
      isCorrect: ev.isCorrect,
      marksObtained: ev.marksObtained
    }));
    
    if (payload.length > 0) {
      await evaluateAttempt({ attemptId, evaluations: payload });
    }
    setEvaluatingAttemptId(null);
    setEvaluations({});
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-4" />
        <h3 className="text-lg font-semibold">Error Loading Exam Details</h3>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-muted/30 text-muted-foreground transition-colors"
          aria-label="Go back to exams list"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-display">{exam.title}</h1>
          {exam.description && (
            <p className="text-sm text-muted-foreground mt-1">{exam.description}</p>
          )}
        </div>
      </div>

      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("questions")}
          className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-[1px] ${
            activeTab === "questions"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
          }`}
        >
          Created Questions
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-[1px] ${
            activeTab === "submissions"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
          }`}
        >
          Submitted Answers
        </button>
      </div>

      {activeTab === "questions" && (
        <div className="space-y-4">
          {exam.questions && exam.questions.length > 0 ? (
            exam.questions.map((q, i) => (
              <div key={q.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded-md mb-2 inline-block">
                      Question {i + 1}
                    </span>
                    <p className="text-sm font-medium whitespace-pre-wrap">{q.text}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
                      {q.marks} Mark{q.marks !== 1 && "s"}
                    </span>
                  </div>
                </div>
                {q.type === "QUIZZ" ? (
                  <div className="mt-4 p-3 bg-muted/10 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
                      Correct Answer
                    </p>
                    <p className="text-sm">
                      {q.correctAnswerText || <span className="italic text-muted-foreground">Pending manual evaluation</span>}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {q.options?.map((opt) => (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                          opt.isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100"
                            : "bg-muted/10 border-border/50 text-muted-foreground"
                        }`}
                      >
                        {opt.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                        )}
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No questions found for this exam.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="space-y-6">
          {exam.attempts && exam.attempts.length > 0 ? (
            exam.attempts.map((attempt) => (
              <div key={attempt.id} className="p-4 rounded-xl border border-border bg-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div>
                    <h3 className="font-semibold text-sm">Student ID: <span className="font-mono text-muted-foreground">{attempt.studentId}</span></h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Submitted: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "Not yet submitted"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Score</span>
                      <span className="text-sm font-bold">
                        {attempt.score ?? "—"} / {exam.totalMarks}
                      </span>
                    </div>
                    {attempt.isPassed === true && (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                        Passed
                      </span>
                    )}
                    {attempt.isPassed === false && (
                      <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
                        Failed
                      </span>
                    )}
                    {attempt.isPassed === null && attempt.submittedAt && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                        Pending Review
                      </span>
                    )}
                    {attempt.isPassed === null && attempt.submittedAt && evaluatingAttemptId !== attempt.id && (
                      <button
                        onClick={() => handleStartEvaluation(attempt.id)}
                        className="ml-2 px-3 py-1.5 bg-[var(--primary)] text-primary-foreground text-xs font-semibold rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                      >
                        Evaluate
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {exam.questions?.map((q, i) => {
                    const answer = attempt.answers?.find((a) => a.questionId === q.id);
                    const selectedOpt = q.options?.find((o) => o.id === answer?.selectedOptionId);
                    
                    return (
                      <div key={q.id} className="bg-muted/10 p-4 rounded-lg border border-border/50">
                        <p className="text-sm font-medium mb-3">
                          <span className="text-muted-foreground mr-2">{i + 1}.</span>
                          {q.text}
                        </p>
                        
                        {q.type === "QUIZZ" ? (
                          <div className="space-y-2">
                            <div className="p-3 bg-card rounded-md border border-border">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Student's Answer</span>
                              <p className="text-sm">{answer?.textAnswer || <span className="italic text-muted-foreground">No answer provided</span>}</p>
                            </div>
                            <div className="p-3 bg-emerald-500/5 rounded-md border border-emerald-500/20">
                              <span className="text-[10px] uppercase font-bold text-emerald-500/70 block mb-1">Expected Answer</span>
                              <p className="text-sm text-emerald-100">{q.correctAnswerText || <span className="italic text-emerald-500/50">Manual evaluation required</span>}</p>
                            </div>
                            {evaluatingAttemptId === attempt.id && answer && (
                              <div className="mt-3 flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-lg">
                                <span className="text-sm font-semibold text-muted-foreground">Mark as:</span>
                                <button
                                  onClick={() => handleEvaluationChange(answer.id, true, q.marks)}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                                    evaluations[answer.id]?.isCorrect === true
                                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                      : "bg-transparent text-muted-foreground border-border hover:bg-muted/50"
                                  }`}
                                >
                                  Correct ({q.marks} marks)
                                </button>
                                <button
                                  onClick={() => handleEvaluationChange(answer.id, false, q.marks)}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                                    evaluations[answer.id]?.isCorrect === false
                                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                      : "bg-transparent text-muted-foreground border-border hover:bg-muted/50"
                                  }`}
                                >
                                  Incorrect (0 marks)
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {q.options?.map((opt) => {
                              const isSelected = answer?.selectedOptionId === opt.id;
                              const isCorrect = opt.isCorrect;
                              
                              let style = "bg-muted/10 border-border/50 text-muted-foreground";
                              let Icon = null;
                              
                              if (isCorrect && isSelected) {
                                style = "bg-emerald-500/10 border-emerald-500/30 text-emerald-100";
                                Icon = CheckCircle2;
                              } else if (isSelected && !isCorrect) {
                                style = "bg-rose-500/10 border-rose-500/30 text-rose-100";
                                Icon = XCircle;
                              } else if (isCorrect && !isSelected) {
                                style = "bg-emerald-500/5 border-emerald-500/30 text-emerald-500/70";
                                Icon = CheckCircle2;
                              }

                              return (
                                <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${style}`}>
                                  {Icon ? <Icon className={`h-4 w-4 shrink-0 ${isCorrect ? "text-emerald-400" : "text-rose-400"}`} /> : <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />}
                                  <span>{opt.text}</span>
                                </div>
                              );
                            })}
                            
                            {evaluatingAttemptId === attempt.id && answer && (
                              <div className="mt-3 col-span-1 sm:col-span-2 flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-lg">
                                <span className="text-sm font-semibold text-muted-foreground">Override Mark:</span>
                                <button
                                  onClick={() => handleEvaluationChange(answer.id, true, q.marks)}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                                    evaluations[answer.id]?.isCorrect === true
                                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                      : "bg-transparent text-muted-foreground border-border hover:bg-muted/50"
                                  }`}
                                >
                                  Correct ({q.marks} marks)
                                </button>
                                <button
                                  onClick={() => handleEvaluationChange(answer.id, false, q.marks)}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                                    evaluations[answer.id]?.isCorrect === false
                                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                                      : "bg-transparent text-muted-foreground border-border hover:bg-muted/50"
                                  }`}
                                >
                                  Incorrect (0 marks)
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {evaluatingAttemptId === attempt.id && (
                  <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => {
                        setEvaluatingAttemptId(null);
                        setEvaluations({});
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEvaluation(attempt.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-primary-foreground hover:bg-[var(--primary)]/90 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      Save Evaluation
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No submissions yet for this exam.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
