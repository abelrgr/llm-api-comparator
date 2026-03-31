import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm hover:shadow-indigo-500/25 hover:shadow-md",
  ghost: "border border-indigo-500 text-indigo-500 hover:bg-indigo-500/10",
  danger:
    "bg-rose-500 hover:bg-rose-600 text-white shadow-sm hover:shadow-rose-500/25 hover:shadow-md",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  isLoading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-xl",
        "transition-all duration-200 cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        "dark:focus-visible:ring-offset-slate-900",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {isLoading && (
        <svg
          className="animate-spin w-4 h-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
