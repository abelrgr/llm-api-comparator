import { useState, useEffect } from "react";
import { useI18n } from "../../hooks/useI18n";
import { formatRelativeTime } from "../../lib/utils";

export default function Footer() {
  const { t } = useI18n();
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("llm_pricing_store");
      if (stored) {
        const data = JSON.parse(stored) as { last_updated?: string };
        if (data.last_updated) setLastUpdate(data.last_updated);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      {/* Subtle dot-grid pattern overlay */}
      <div
        className="relative"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-400">
            {/* ── Left: copyright ───────────────────────────────────────── */}
            <div className="flex flex-col items-center sm:items-start gap-1">
              <p className="font-medium text-slate-300">
                <span className="text-indigo-400">⚡</span> LLM Comparator
              </p>
              <p className="text-xs text-slate-500">
                © 2026 All rights reserved
              </p>
            </div>

            {/* ── Center: stack + last update ──────────────────────────── */}
            <div className="flex flex-col items-center gap-1">
              <p>{t("footer.built_with")}</p>
              {lastUpdate && (
                <p className="text-xs text-slate-500">
                  {t("footer.last_update")}: {formatRelativeTime(lastUpdate)}
                </p>
              )}
            </div>

            {/* ── Right: links ─────────────────────────────────────────── */}
            <div className="flex items-center gap-5">
              {/* GitHub */}
              <a
                href="https://github.com/abelrgr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>

              {/* Portfolio / Made by */}
              <a
                href="https://abelgalloruiz.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span className="text-xs">{t("footer.made_by")}</span>
                <span className="font-medium text-slate-200 hover:text-indigo-400 transition-colors">
                  Abel Gallo Ruiz
                </span>
              </a>

              {/* Back to top */}
              <button
                onClick={scrollToTop}
                aria-label={t("footer.back_to_top")}
                className="hover:text-white transition-colors"
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
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
