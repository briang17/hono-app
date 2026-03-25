import * as React from "react";
import { cn } from "../../lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className={cn(
            "peer h-4 w-4 shrink-0 rounded border border-[#e5e7eb] bg-[#fafafa] text-[#D0AC61] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D0AC61] focus-visible:ring-offset-2 checked:bg-[#D0AC61] checked:border-[#D0AC61] disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-[#fafafa] opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
