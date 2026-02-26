import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
  default: "bg-[#D0AC61] text-white hover:bg-[#b8964f] active:bg-[#a68845]",
  secondary: "bg-[#1C2A52] text-white hover:bg-[#162040] active:bg-[#10182d]",
  outline: "border border-[#D0AC61] text-[#D0AC61] hover:bg-[#D0AC61] hover:text-white",
  ghost: "hover:bg-[#1C2A52]/10 hover:text-[#1C2A52]",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const sizeClasses = {
      default: "px-4 py-2",
      sm: "px-3 py-1.5 text-sm",
      lg: "px-6 py-3",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D0AC61] disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
