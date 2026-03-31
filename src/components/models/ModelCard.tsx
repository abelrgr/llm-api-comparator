import { useRef, useEffect, useState } from "react";
import {
  type LLMModel,
  PROVIDER_COLORS,
  PROVIDER_LABELS,
} from "../../types/index";
import { useI18n } from "../../hooks/useI18n";
import { cn } from "../../lib/utils";
import CodeExampleModal from "./CodeExampleModal";

const CAP_LABEL_KEYS: Record<string, string> = {
  vision: "models.capabilities.vision",
  function_calling: "models.capabilities.function_calling",
  streaming: "models.capabilities.streaming",
  fine_tuning: "models.capabilities.fine_tuning",
  long_context: "models.capabilities.long_context",
  code: "models.capabilities.code",
  reasoning: "models.capabilities.reasoning",
};

function formatContextWindow(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M tokens`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K tokens`;
  return `${tokens} tokens`;
}

function formatPrice(usd: number): string {
  if (usd === 0) return "$0";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}

interface ModelCardProps {
  model: LLMModel;
  isSelected: boolean;
  isBestValue: boolean;
  isMostCapable: boolean;
  isMaxReached: boolean;
  onToggle: () => void;
  animDelay?: number;
}

export default function ModelCard({
  model,
  isSelected,
  isBestValue,
  isMostCapable,
  isMaxReached,
  onToggle,
  animDelay = 0,
}: ModelCardProps) {
  const { t } = useI18n();
  const providerColor = PROVIDER_COLORS[model.provider];
  const cardRef = useRef<HTMLElement>(null);

  // Reveal animation: 'idle' → 'active' (intersected) → 'done' (transition finished)
  const [revealPhase, setRevealPhase] = useState<"idle" | "active" | "done">(
    "idle",
  );
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealPhase("active");
          io.disconnect();
          // Strip reveal classes once transition finishes so hover transitions aren't delayed
          setTimeout(() => setRevealPhase("done"), 650 + animDelay);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDisabled = !isSelected && isMaxReached;

  return (
    <article
      ref={cardRef}
      className={cn(
        "relative flex flex-col rounded-2xl overflow-hidden",
        "transition-all duration-200",
        // Reveal animation classes (removed once done so hover delay isn't affected)
        revealPhase === "idle" && "reveal",
        revealPhase === "active" && "reveal revealed",
        // Base card
        model.is_local
          ? "border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/60"
          : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md dark:shadow-lg dark:shadow-black/40",
        // Hover lift
        !isDisabled &&
          "hover:-translate-y-0.5 hover:shadow-xl dark:hover:shadow-black/60",
        // Selected glow
        isSelected &&
          "ring-2 ring-indigo-500/60 border-indigo-400 dark:border-indigo-500 shadow-indigo-500/10 shadow-lg",
        // Disabled (max reached, not selected)
        isDisabled && "opacity-50",
      )}
      style={
        revealPhase !== "done"
          ? { transitionDelay: `${animDelay}ms` }
          : undefined
      }
    >
      {/* ── Provider color top bar ─────────────────────────────────────────── */}
      <div
        className="h-1 w-full shrink-0"
        style={{ backgroundColor: model.is_local ? "#6b7280" : providerColor }}
      />

      {/* ── Card body ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            {/* Provider badge */}
            <span
              className="self-start text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${providerColor}22`,
                color: providerColor,
              }}
            >
              {PROVIDER_LABELS[model.provider]}
            </span>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-tight truncate">
              {model.name}
            </h3>
          </div>

          {/* Status badges */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            {isBestValue && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 whitespace-nowrap">
                {t("models.best_value")}
              </span>
            )}
            {isMostCapable && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20 whitespace-nowrap">
                {t("models.most_capable")}
              </span>
            )}
            {model.deprecated && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 whitespace-nowrap">
                Deprecated
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1">
          {model.description}
        </p>

        {/* Pricing section */}
        <div>
          {model.is_local ? (
            /* Local / self-hosted model */
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-emerald-500">
                  {t("models.free")}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {t("models.self_hosted")}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  {t("models.open_source")}
                </span>
              </div>
            </div>
          ) : (
            /* API model pricing */
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    {t("models.input")}
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                    {formatPrice(model.pricing.input_per_1m)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    {t("models.output")}
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                    {formatPrice(model.pricing.output_per_1m)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                {t("models.per_1m_tokens")}
              </p>
            </div>
          )}

          {/* Context window + latency */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <svg
                className="w-3 h-3 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h7"
                />
              </svg>
              {formatContextWindow(model.pricing.context_window)}
            </p>
            {model.latency?.ttft_ms != null && (
              <p
                className="text-xs text-slate-400 flex items-center gap-1"
                title="Median time to first token"
              >
                <svg
                  className="w-3 h-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {model.latency!.ttft_ms! >= 1000
                  ? `${(model.latency!.ttft_ms! / 1000).toFixed(1)}s TTFT`
                  : `${model.latency!.ttft_ms}ms TTFT`}
              </p>
            )}
            {model.latency?.tps != null && (
              <p
                className="text-xs text-slate-400 flex items-center gap-1"
                title="Median output tokens per second"
              >
                <svg
                  className="w-3 h-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {model.latency?.tps} tok/s
              </p>
            )}
            {model.is_local && model.latency?.ttft_ms == null && (
              <p
                className="text-xs text-slate-400 flex items-center gap-1"
                title="Latency depends on your hardware"
              >
                <svg
                  className="w-3 h-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Hardware dependent
              </p>
            )}
          </div>
        </div>

        {/* Capabilities */}
        {model.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {model.capabilities.map((cap) => (
              <span
                key={cap}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              >
                {t(CAP_LABEL_KEYS[cap])}
              </span>
            ))}
          </div>
        )}

        {/* Code Example button */}
        <button
          onClick={() => setShowCode(true)}
          className="w-full py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-400"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          {t("models.code_example")}
        </button>

        {/* Select / deselect button */}
        <button
          onClick={onToggle}
          disabled={isDisabled}
          aria-pressed={isSelected}
          aria-label={
            isSelected
              ? `${t("models.deselect")} ${model.name}`
              : `${t("models.select")} ${model.name}`
          }
          className={cn(
            "w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            isSelected
              ? "bg-indigo-500/10 border border-indigo-500 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/20"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600",
            isDisabled && "cursor-not-allowed",
          )}
        >
          {isSelected ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t("models.selected")}
            </span>
          ) : (
            t("models.select")
          )}
        </button>
      </div>

      {/* Code Example Modal */}
      <CodeExampleModal
        model={model}
        isOpen={showCode}
        onClose={() => setShowCode(false)}
        t={t}
      />

      {/* Source link */}
      <a
        href={model.source_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 px-5 py-2 text-[10px] text-slate-400 hover:text-indigo-500 transition-colors border-t border-slate-100 dark:border-slate-700"
        aria-label={`${t("models.source_pricing")} – ${model.name}`}
      >
        <svg
          className="w-3 h-3 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
        {t("models.source_pricing")}
      </a>
    </article>
  );
}
