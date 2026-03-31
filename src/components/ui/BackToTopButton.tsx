import { useState, useEffect, useCallback } from "react";
import { useI18n } from "../../hooks/useI18n";
import { cn } from "../../lib/utils";

export default function BackToTopButton() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      onClick={scrollTop}
      aria-label={t("about.back_to_top")}
      className={cn(
        "fixed bottom-15 right-15 z-50",
        "w-12 h-12 rounded-full flex items-center justify-center",
        "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30",
        "hover:bg-indigo-600 hover:scale-110 focus-visible:outline-2 focus-visible:outline-indigo-400",
        "transition-all duration-300",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    </button>
  );
}
