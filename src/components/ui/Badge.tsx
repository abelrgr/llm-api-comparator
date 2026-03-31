import { type ReactNode, type CSSProperties } from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "solid" | "outline" | "subtle";

interface BadgeProps {
  children: ReactNode;
  color?: string; // hex color; if omitted, defaults to indigo
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  color,
  variant = "subtle",
  className,
}: BadgeProps) {
  const style: CSSProperties | undefined = color
    ? {
        backgroundColor: variant === "solid" ? color : `${color}22`,
        borderColor: variant === "outline" ? color : "transparent",
        color: variant === "solid" ? "#fff" : color,
      }
    : undefined;

  return (
    <span
      style={style}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold border",
        // Fallback styles when no color prop
        !color &&
          variant === "subtle" &&
          "bg-indigo-500/10 text-indigo-400 border-transparent",
        !color &&
          variant === "solid" &&
          "bg-indigo-500 text-white border-transparent",
        !color && variant === "outline" && "border-indigo-500 text-indigo-500",
        className,
      )}
    >
      {children}
    </span>
  );
}
