import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}

export function Card({
  children,
  className,
  hover = false,
  padding = true,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        padding && "p-6",
        "bg-white dark:bg-slate-800",
        "border border-slate-200 dark:border-slate-700",
        "shadow-md shadow-slate-200/60 dark:shadow-lg dark:shadow-black/40",
        hover &&
          "transition-all duration-200 cursor-default hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200 dark:hover:shadow-black/60",
        className,
      )}
    >
      {children}
    </div>
  );
}
