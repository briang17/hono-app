import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import type { Question } from "../../features/openhouse/api/openhouse.api";
import { cn } from "../../lib/utils";

interface QuestionFieldProps {
  question: Question;
  field: any;
  serverError?: string;
  isLoading?: boolean;
}

export default function QuestionField({ question, field, serverError, isLoading }: QuestionFieldProps) {
  const renderField = () => {
    switch (question.type) {
      case "short_text":
        return (
          <Input
            id={field.name}
            name={field.name}
            type="text"
            value={field.state.value as string || ""}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full min-w-[280px]"
          />
        );

      case "long_text":
        return (
          <Textarea
            id={field.name}
            name={field.name}
            value={field.state.value as string || ""}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full min-w-[280px] resize-y"
          />
        );

      case "number":
        return (
          <Input
            id={field.name}
            name={field.name}
            type="number"
            value={field.state.value as number || ""}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            placeholder={question.placeholder}
            min={question.validation?.min}
            max={question.validation?.max}
            className="w-full min-w-[280px]"
          />
        );

      case "multiple_choice":
        return (
          <Select
            id={field.name}
            name={field.name}
            value={field.state.value as string || ""}
            onChange={(e) => field.handleChange(e.target.value)}
            className="w-full min-w-[280px]"
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        );

      case "checkboxes":
        const selectedValues = (field.state.value as string[]) || [];
        return (
          <div className="space-y-2 w-full min-w-[280px]">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  id={`${field.name}-${option}`}
                  name={`${field.name}-${option}`}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v) => v !== option);
                    field.handleChange(newValues);
                  }}
                />
                <span className="text-sm text-[#1C2A52]">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#f8fafc] border-l-[3px] border-[#D0AC61] p-[16px]">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-10 w-full min-w-[280px]" />
      </div>
    );
  }

  const hasError = serverError || field.state.meta.errors.length > 0;
  const errorMessage = serverError || field.state.meta.errors[0];

  return (
    <div className={cn(
      "bg-[#f8fafc] border-l-[3px] p-[16px] transition-colors",
      hasError ? "border-[#D0AC61] bg-[#fef9c3]" : "border-[#D0AC61]"
    )}>
      <Label htmlFor={field.name} className="text-sm text-[#1C2A52]">
        {question.label}
        {question.required && <span className="text-[#D0AC61] ml-1">*</span>}
      </Label>
      <div className="mt-2">
        {renderField()}
      </div>
      {errorMessage && (
        <p className="text-sm text-[#D0AC61] mt-1 font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
