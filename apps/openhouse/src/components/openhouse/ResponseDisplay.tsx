interface ResponseDisplayProps {
  questionId: string;
  questionLabel: string;
  value: string | number | string[];
  showDebug?: boolean;
}

export default function ResponseDisplay({ questionId, questionLabel, value, showDebug }: ResponseDisplayProps) {
  const formatValue = (): string => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return String(value);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-[8px]">
      <div className="flex-1 sm:flex-1">
        <span className="text-sm text-[#6b7280]">
          {questionLabel}:
        </span>
        {showDebug && (
          <p className="text-[10px] text-[#6b7280] opacity-[0.5] mt-[2px]">
            ID: {questionId}
          </p>
        )}
      </div>
      <span className="text-sm text-[#1C2A52] font-medium sm:text-right">
        {formatValue()}
      </span>
    </div>
  );
}
