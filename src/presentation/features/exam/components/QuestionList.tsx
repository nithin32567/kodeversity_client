/**
 * QuestionList.tsx
 * Left panel of the Exam Builder showing the list of questions.
 */
import { CheckCircle2, AlertCircle, Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";

export interface QuestionDraft {
  id: string;
  text: string;
  hint?: string;
  timeLimit?: number;
  marks: number;
  optional?: boolean;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
}

interface QuestionListProps {
  questions: QuestionDraft[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

function isQuestionComplete(q: QuestionDraft): boolean {
  return (
    q.text.trim().length > 0 &&
    q.options.length >= 2 &&
    q.options.some((o) => o.isCorrect) &&
    q.options.every((o) => o.text.trim().length > 0)
  );
}

export function QuestionList({
  questions,
  selectedIndex,
  onSelect,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
}: QuestionListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Questions ({questions.length})
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {questions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-xs text-muted-foreground">
              No questions yet. Click "+ Add Question" below.
            </p>
          </div>
        )}

        {questions.map((q, i) => {
          const complete = isQuestionComplete(q);
          const isSel = i === selectedIndex;
          const preview = q.text.trim() ? q.text.slice(0, 40) : "Empty question";

          return (
            <div
              key={q.id}
              className={`group relative flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-150 ${
                isSel
                  ? "bg-[var(--primary)]/10 border border-[var(--primary)]/40"
                  : "border border-transparent hover:bg-muted/20"
              }`}
              onClick={() => onSelect(i)}
            >
              {/* Status dot */}
              <span className="shrink-0">
                {complete ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                )}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  Q{i + 1}.{" "}
                  <span className={q.text.trim() ? "" : "text-muted-foreground italic"}>
                    {preview}
                    {q.text.trim().length > 40 ? "…" : ""}
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {q.options.length} options • {q.marks} mark{q.marks !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Actions (visible on hover/select) */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  id={`move-q-up-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp(i);
                  }}
                  disabled={i === 0}
                  aria-label="Move question up"
                  className="h-5 w-5 rounded hover:bg-muted/40 flex items-center justify-center disabled:opacity-30 transition-colors"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  id={`move-q-down-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown(i);
                  }}
                  disabled={i === questions.length - 1}
                  aria-label="Move question down"
                  className="h-5 w-5 rounded hover:bg-muted/40 flex items-center justify-center disabled:opacity-30 transition-colors"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button
                  id={`delete-q-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(i);
                  }}
                  aria-label="Delete question"
                  className="h-5 w-5 rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-border">
        <button
          id="add-question-btn"
          onClick={onAdd}
          aria-label="Add a new question"
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--primary)]/40 py-2 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors duration-150"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Question
        </button>
      </div>
    </div>
  );
}
