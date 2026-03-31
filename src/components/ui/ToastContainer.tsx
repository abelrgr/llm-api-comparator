import { useState, useCallback, useEffect } from "react";
import { Toast, type ToastData } from "./Toast";

// ─── Global imperative API ────────────────────────────────────────────────────
type ToastInput = Omit<ToastData, "id">;
let _addToast: ((t: ToastInput) => void) | null = null;

/** Call this anywhere (outside React) to show a toast. */
export function showToast(toast: ToastInput): void {
  if (_addToast) {
    _addToast(toast);
  } else {
    // Fallback: broadcast via custom event if container not yet mounted
    window?.dispatchEvent(new CustomEvent("llm:toast", { detail: toast }));
  }
}

// ─── Container component ──────────────────────────────────────────────────────
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: ToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register global handler
  useEffect(() => {
    _addToast = addToast;
    return () => {
      _addToast = null;
    };
  }, [addToast]);

  // Listen for event-based toasts (from other Astro islands)
  useEffect(() => {
    const handler = (e: Event) =>
      addToast((e as CustomEvent<ToastInput>).detail);
    window.addEventListener("llm:toast", handler);
    return () => window.removeEventListener("llm:toast", handler);
  }, [addToast]);

  return (
    <div
      className="fixed top-4 right-4 z-200 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  );
}
