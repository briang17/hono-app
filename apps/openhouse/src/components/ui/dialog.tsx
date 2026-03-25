import * as React from "react";
import { cn } from "../../lib/utils";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ open, onOpenChange, children, className, ...props }, ref) => {
    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          className
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onOpenChange(false);
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div
          className={cn(
            "relative w-full max-w-lg bg-white rounded-lg shadow-xl",
            className
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={() => onOpenChange(false)}
              className="text-[#6b7280] hover:text-[#1C2A52] transition-colors p-1 rounded hover:bg-gray-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12 12M6 6l12 12M18 6"
                />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  }
);
Dialog.displayName = "Dialog";

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("bg-white rounded-lg", className)} {...props} />
    );
  }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 pb-4 border-b border-[#e5e7eb]", className)} {...props}>
        {children}
      </div>
    );
  }
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h2 ref={ref} className={cn("text-lg font-semibold text-[#1C2A52]", className)} {...props}>
        {children}
      </h2>
    );
  });
DialogTitle.displayName = "DialogTitle";

const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center justify-end gap-2 p-6", className)} {...props}>
        {children}
      </div>
    );
  }
);
DialogFooter.displayName = "DialogFooter";

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter };
