import { QuestionList, type QuestionDraft } from "./QuestionList";
import { QuestionEditor } from "./QuestionEditor";

interface ExamQuestionBuilderStepProps {
  questions: QuestionDraft[];
  selectedQIndex: number;
  isSameMark: boolean;
  setSelectedQIndex: (index: number) => void;
  handleAddQuestion: () => void;
  handleDeleteQuestion: (index: number) => void;
  handleMoveUp: (index: number) => void;
  handleMoveDown: (index: number) => void;
  handleQuestionChange: (updated: QuestionDraft) => void;
}

export function ExamQuestionBuilderStep({
  questions,
  selectedQIndex,
  isSameMark,
  setSelectedQIndex,
  handleAddQuestion,
  handleDeleteQuestion,
  handleMoveUp,
  handleMoveDown,
  handleQuestionChange,
}: ExamQuestionBuilderStepProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" style={{ minHeight: 520 }}>
      <div className="grid h-full" style={{ gridTemplateColumns: "260px 1fr" }}>
        {/* Left: question list */}
        <div className="border-r border-border flex flex-col" style={{ minHeight: 520 }}>
          <QuestionList
            questions={questions}
            selectedIndex={selectedQIndex}
            onSelect={setSelectedQIndex}
            onAdd={handleAddQuestion}
            onDelete={handleDeleteQuestion}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        </div>

        {/* Right: editor */}
        <div className="flex flex-col" style={{ minHeight: 520 }}>
          {questions[selectedQIndex] ? (
            <QuestionEditor
              question={questions[selectedQIndex]}
              questionIndex={selectedQIndex}
              isSameMark={isSameMark}
              onChange={handleQuestionChange}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Select a question from the list to edit it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
