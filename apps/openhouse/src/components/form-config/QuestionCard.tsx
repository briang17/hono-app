import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Trash2, MoveDown, MoveUp } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Question } from "../../features/openhouse/api/openhouse.api";

interface QuestionCardProps {
  question: Question;
  index: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  isDragging: boolean;
}

export default function QuestionCard({
  question,
  index,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  isDragging,
}: QuestionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const getQuestionTypeLabel = () => {
    const typeLabels = {
      short_text: "Short Text",
      long_text: "Long Text",
      number: "Number",
      multiple_choice: "Multiple Choice",
      checkboxes: "Checkboxes",
    };
    return typeLabels[question.type] || "Unknown";
  };

  const getQuestionTypeBadge = () => {
    const badgeColors = {
      short_text: "bg-[#D0AC61] text-white",
      long_text: "bg-[#D0AC61] text-white",
      number: "bg-[#D0AC61] text-white",
      multiple_choice: "bg-[#D0AC61] text-white",
      checkboxes: "bg-[#D0AC61] text-white",
    };
    return (
      <span className={cn("text-xs px-2 py-1 rounded-md", badgeColors[question.type] || "bg-gray-500 text-white")}>
        {getQuestionTypeLabel()}
      </span>
    );
  };

  const handleDeleteClick = () => {
    setShowDelete(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(question.id);
    setShowDelete(false);
  };

  const handleDeleteCancel = () => {
    setShowDelete(false);
  };

  return (
    <div
      className={cn(
        "bg-[#f8fafc] border-l-[3px] border-[#D0AC61] p-4 transition-all duration-200",
        isDragging && "opacity-50 translate-y-1 shadow-lg",
        isHovered && "translate-y-[-2px] shadow-md"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-[#1C2A52]">#{index + 1}</span>
            {getQuestionTypeBadge()}
          </div>

          <h3 className="text-base font-semibold text-[#1C2A52]">
            {question.label}
            {question.required && <span className="text-[#D0AC61] ml-1">*</span>}
          </h3>

          {question.placeholder && (
            <p className="text-sm text-[#6b7280]">
              Placeholder: {question.placeholder}
            </p>
          )}

          {(question.type === "multiple_choice" || question.type === "checkboxes") && question.options && (
            <div className="mt-2">
              <p className="text-xs text-[#6b7280] mb-1">Options:</p>
              <div className="flex flex-wrap gap-1">
                {question.options.map((option, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-gray-100 px-2 py-1 rounded text-xs text-[#6b7280]"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(question.type === "short_text" || question.type === "long_text" || question.type === "number") && question.validation && (
            <div className="mt-2">
              <p className="text-xs text-[#6b7280] mb-1">Validation:</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {question.validation.minLength && (
                  <span className="bg-gray-100 px-2 py-1 rounded">Min: {question.validation.minLength} chars</span>
                )}
                {question.validation.maxLength && (
                  <span className="bg-gray-100 px-2 py-1 rounded">Max: {question.validation.maxLength} chars</span>
                )}
                {question.validation.min !== undefined && (
                  <span className="bg-gray-100 px-2 py-1 rounded">Min: {question.validation.min}</span>
                )}
                {question.validation.max !== undefined && (
                  <span className="bg-gray-100 px-2 py-1 rounded">Max: {question.validation.max}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0 || isDragging}
            className={cn(
              "p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              index === 0 && "opacity-50 cursor-not-allowed"
            )}
            title="Move up"
          >
            <MoveUp className="w-4 h-4 text-[#6b7280]" />
          </button>

          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={isDragging}
            className={cn(
              "p-1 hover:bg-gray-100 rounded transition-colors",
              isDragging && "opacity-50 cursor-not-allowed"
            )}
            title="Move down"
          >
            <MoveDown className="w-4 h-4 text-[#6b7280]" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(question)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Edit question"
          >
            <Edit className="w-4 h-4 text-[#6b7280]" />
          </button>

          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowDelete(true)}
              onMouseLeave={() => setShowDelete(false)}
              className={cn(
                "p-1 rounded transition-colors",
                showDelete && "bg-red-50 hover:bg-red-100"
              )}
              onClick={handleDeleteClick}
              title="Delete question"
            >
              {showDelete ? <ChevronUp className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
            </button>

            {showDelete && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50">
                <p className="text-sm text-[#6b7280] mb-2">Delete question?</p>
                <p className="text-xs text-[#6b7280]">{question.label}</p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="px-3 py-1 text-sm bg-[#dc2626] text-white hover:bg-[#b8964f] rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
