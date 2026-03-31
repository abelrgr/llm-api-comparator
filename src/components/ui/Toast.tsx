import { useEffect, useState, useCallback } from "react";
import { cn } from "../../lib/utils";

export interface ToastData {
  id: string;
  message: string;
  type?: "info" | "success" | "error" | "warning";
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const typeStyles: Record<NonNullable<ToastData["type"]>, string> = {
  info: "bg-slate-800 border-slate-600 text-white",
  success: "bg-emerald-900/90 border-emerald-600 text-emerald-100",
  error: "bg-rose-900/90 border-rose-600 text-rose-100",
  warning: "bg-amber-900/90 border-amber-600 text-amber-100",
};

const typeIcons: Record<NonNullable<ToastData["type"]>, string> = {
  info: "💬",
  success: "✅",
  error: "❌",
  warning: "⚠️",
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration ?? 4000;
  const type = toast.type ?? "info";

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    // Trigger enter transition
    const enterRaf = requestAnimationFrame(() => setVisible(true));

    // Progress bar
    const startTime = Date.now();
    let animFrame: number;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) animFrame = requestAnimationFrame(tick);
    };
    animFrame = requestAnimationFrame(tick);

    // Auto-dismiss
    const timer = setTimeout(dismiss, duration);

    return () => {
      cancelAnimationFrame(enterRaf);
      cancelAnimationFrame(animFrame);
      clearTimeout(timer);
    };
  }, [duration, dismiss]);

  return (
    <div
      role="alert"
      className={cn(
        "relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl",
        "backdrop-blur-sm min-w-70 max-w-sm overflow-hidden",
        "transition-all duration-300",
        typeStyles[type],
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full",
      )}
    >
      <span className="text-lg shrink-0 mt-0.5">{typeIcons[type]}</span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={dismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30 transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
