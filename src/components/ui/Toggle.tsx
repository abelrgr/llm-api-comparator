import { useId } from "react";
import { cn } from "../../lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  className,
}: ToggleProps) {
  const id = useId();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        role="switch"
        aria-checked={checked}
        id={id}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full",
          "transition-colors duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "dark:focus-visible:ring-offset-slate-900",
          checked ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm",
            "transition-transform duration-200",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}
