import * as React from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "w-full h-10 appearance-none rounded-md border border-[#e5e7eb] bg-[#fafafa] px-3 pr-10 text-sm text-[#1C2A52] placeholder:text-[#6b7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D0AC61] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280] pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
