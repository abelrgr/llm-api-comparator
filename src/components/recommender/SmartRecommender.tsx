import { useState, useEffect, useRef, useCallback } from "react";
import { useAppState, useAppDispatch } from "../../store/appStore";
import { useI18n } from "../../hooks/useI18n";
import { cn } from "../../lib/utils";
import {
  getRecommendations,
  type RecommenderParams,
  type RecommenderPriority,
  type RecommenderResult,
} from "../../lib/recommender";
import {
  PROVIDER_COLORS,
  PROVIDER_LABELS,
  type ModelCapability,
} from "../../types/index";

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_CAPABILITIES: ModelCapability[] = [
  "vision",
  "function_calling",
  "streaming",
  "fine_tuning",
  "long_context",
  "code",
  "reasoning",
];

const CONTEXT_OPTIONS = [
  { label: "8K", value: 8_000 },
  { label: "32K", value: 32_000 },
  { label: "128K", value: 128_000 },
  { label: "200K", value: 200_000 },
];

const RANK_MEDALS = ["🥇", "🥈", "🥉"] as const;
const RANK_COLORS = [
  "from-amber-400/20 to-amber-600/10 border-amber-500/40",
  "from-slate-300/20 to-slate-400/10 border-slate-400/40",
  "from-orange-400/20 to-orange-600/10 border-orange-500/40",
] as const;

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-400 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] text-slate-400 w-7 text-right">{value}</span>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────
function ResultCard({
  result,
  t,
}: {
  result: RecommenderResult;
  t: (k: string) => string;
}) {
  const { model, rank, score, scores } = result;
  const providerColor = PROVIDER_COLORS[model.provider];

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-linear-to-br p-4 gap-3",
        RANK_COLORS[rank - 1],
      )}
    >
      {/* Rank medal + overall score */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-lg leading-none">
              {RANK_MEDALS[rank - 1]}
            </span>
            <span
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${providerColor}30`,
                color: providerColor,
              }}
            >
              {PROVIDER_LABELS[model.provider]}
            </span>
          </div>
          <span className="text-sm font-bold text-white leading-tight truncate">
            {model.name}
          </span>
          <span className="text-[11px] text-slate-400 line-clamp-2">
            {model.description}
          </span>
        </div>
        <div className="shrink-0 flex flex-col items-end">
          <span className="text-2xl font-black text-white leading-none">
            {score}
          </span>
          <span className="text-[10px] text-slate-400">
            {t("recommender.match_score")}
          </span>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-slate-800/60 py-2 px-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">
            {t("common.input")}
          </div>
          <div className="text-sm font-semibold text-white">
            {model.is_local
              ? t("models.free")
              : `$${model.pricing.input_per_1m.toFixed(model.pricing.input_per_1m < 0.01 ? 4 : 2)}`}
          </div>
          <div className="text-[10px] text-slate-500">
            {t("models.per_1m_tokens")}
          </div>
        </div>
        <div className="rounded-xl bg-slate-800/60 py-2 px-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">
            {t("common.output")}
          </div>
          <div className="text-sm font-semibold text-white">
            {model.is_local
              ? t("models.free")
              : `$${model.pricing.output_per_1m.toFixed(model.pricing.output_per_1m < 0.01 ? 4 : 2)}`}
          </div>
          <div className="text-[10px] text-slate-500">
            {t("models.per_1m_tokens")}
          </div>
        </div>
      </div>

      {/* Score bars */}
      <div className="flex flex-col gap-1.5">
        <ScoreBar
          label={t("recommender.score_cost")}
          value={scores.cost}
          color="#10b981"
        />
        <ScoreBar
          label={t("recommender.score_capability")}
          value={scores.capability}
          color="#6366f1"
        />
        <ScoreBar
          label={t("recommender.score_latency")}
          value={scores.latency}
          color="#f59e0b"
        />
        <ScoreBar
          label={t("recommender.score_context")}
          value={scores.context}
          color="#3b82f6"
        />
      </div>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1">
        {model.capabilities.map((cap) => (
          <span
            key={cap}
            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/70 text-slate-300"
          >
            {t(`models.capabilities.${cap}`)}
          </span>
        ))}
      </div>

      {/* Context window */}
      <div className="text-[11px] text-slate-400">
        {t("models.context_window")}:{" "}
        <span className="text-slate-200 font-medium">
          {model.pricing.context_window >= 1_000_000
            ? `${(model.pricing.context_window / 1_000_000).toFixed(0)}M`
            : `${(model.pricing.context_window / 1_000).toFixed(0)}K`}{" "}
          tokens
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SmartRecommender() {
  const { t } = useI18n();
  const { pricingStore } = useAppState();
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "results">("form");
  const [results, setResults] = useState<RecommenderResult[]>([]);
  const [noResults, setNoResults] = useState(false);

  // Form state
  const [priority, setPriority] = useState<RecommenderPriority>("balanced");
  const [requiredCaps, setRequiredCaps] = useState<ModelCapability[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(50);
  const [noPriceLimit, setNoPriceLimit] = useState(true);
  const [minContext, setMinContext] = useState<number | null>(null);
  const [includeLocal, setIncludeLocal] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const reset = useCallback(() => {
    setStep("form");
    setResults([]);
    setNoResults(false);
  }, []);

  // Listen for custom event
  useEffect(() => {
    const handler = () => {
      triggerRef.current = document.activeElement as HTMLElement;
      setOpen(true);
      reset();
    };
    window.addEventListener("open-recommender", handler);
    return () => window.removeEventListener("open-recommender", handler);
  }, [reset]);

  // Focus modal on open
  useEffect(() => {
    if (open) modalRef.current?.focus();
  }, [open]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close]);

  function toggleCap(cap: ModelCapability) {
    setRequiredCaps((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap],
    );
  }

  function handleFind() {
    const params: RecommenderParams = {
      priority,
      required_capabilities: requiredCaps,
      max_input_price: noPriceLimit ? null : maxPrice,
      min_context_window: minContext,
      include_local: includeLocal,
    };
    const found = getRecommendations(pricingStore.models, params);
    setResults(found);
    setNoResults(found.length === 0);
    setStep("results");
  }

  function handleCompare() {
    dispatch({ type: "CLEAR_SELECTION" });
    results.forEach((r) => dispatch({ type: "SELECT_MODEL", id: r.model.id }));
    close();
    setTimeout(() => {
      document
        .getElementById("calculator")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }

  const PRIORITY_OPTIONS: {
    key: RecommenderPriority;
    icon: string;
    titleKey: string;
    descKey: string;
  }[] = [
    {
      key: "cheapest",
      icon: "💰",
      titleKey: "recommender.priority_cheapest",
      descKey: "recommender.priority_cheapest_desc",
    },
    {
      key: "most_capable",
      icon: "🧠",
      titleKey: "recommender.priority_capable",
      descKey: "recommender.priority_capable_desc",
    },
    {
      key: "balanced",
      icon: "⚖️",
      titleKey: "recommender.priority_balanced",
      descKey: "recommender.priority_balanced_desc",
    },
    {
      key: "fastest",
      icon: "⚡",
      titleKey: "recommender.priority_fastest",
      descKey: "recommender.priority_fastest_desc",
    },
  ];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label={t("recommender.title")}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full max-w-2xl rounded-2xl overflow-hidden",
          "bg-slate-900 border border-slate-700/60",
          "shadow-2xl shadow-black/60",
          "focus:outline-none",
          "max-h-[90vh] flex flex-col",
        )}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <h2 className="text-base font-bold text-white">
                {t("recommender.title")}
              </h2>
              <p className="text-xs text-slate-400">
                {t("recommender.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={close}
            aria-label={t("recommender.close")}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
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
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1">
          {/* ─── FORM STEP ─────────────────────────────────────────────── */}
          {step === "form" && (
            <div className="px-6 py-5 space-y-6">
              {/* Priority */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  {t("recommender.step_priority")}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setPriority(opt.key)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                        priority === opt.key
                          ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/40"
                          : "border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70",
                      )}
                    >
                      <span className="text-xl leading-none mt-0.5">
                        {opt.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white">
                          {t(opt.titleKey)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {t(opt.descKey)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Required capabilities */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  {t("recommender.step_capabilities")}
                  <span className="ml-2 normal-case font-normal text-slate-500">
                    ({t("recommender.optional")})
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ALL_CAPABILITIES.map((cap) => (
                    <button
                      key={cap}
                      onClick={() => toggleCap(cap)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border font-medium transition-all",
                        requiredCaps.includes(cap)
                          ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                          : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-500 hover:text-slate-300",
                      )}
                    >
                      {t(`models.capabilities.${cap}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  {t("recommender.step_budget")}
                  <span className="ml-2 normal-case font-normal text-slate-500">
                    ({t("recommender.optional")})
                  </span>
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noPriceLimit}
                      onChange={(e) => setNoPriceLimit(e.target.checked)}
                      className="w-4 h-4 rounded accent-indigo-500"
                    />
                    <span className="text-sm text-slate-300">
                      {t("recommender.no_budget_limit")}
                    </span>
                  </label>
                  {!noPriceLimit && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">
                          {t("recommender.max_input_price")}:{" "}
                          <span className="text-indigo-400 font-semibold">
                            ${maxPrice}/1M
                          </span>
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={75}
                        step={0.5}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>$0.10</span>
                        <span>$75</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Minimum context window */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  {t("recommender.step_context")}
                  <span className="ml-2 normal-case font-normal text-slate-500">
                    ({t("recommender.optional")})
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setMinContext(null)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full border font-medium transition-all",
                      minContext === null
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                        : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-500 hover:text-slate-300",
                    )}
                  >
                    {t("recommender.context_any")}
                  </button>
                  {CONTEXT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMinContext(opt.value)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border font-medium transition-all",
                        minContext === opt.value
                          ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                          : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-500 hover:text-slate-300",
                      )}
                    >
                      {opt.label}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Include local */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLocal}
                  onChange={(e) => setIncludeLocal(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <span className="text-sm text-slate-300">
                  {t("recommender.include_local")}
                </span>
              </label>
            </div>
          )}

          {/* ─── RESULTS STEP ──────────────────────────────────────────── */}
          {step === "results" && (
            <div className="px-6 py-5 space-y-4">
              {noResults ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <span className="text-4xl">🔍</span>
                  <p className="text-base font-semibold text-white">
                    {t("recommender.no_results")}
                  </p>
                  <p className="text-sm text-slate-400">
                    {t("recommender.no_results_hint")}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-400">
                    {t("recommender.results_intro")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {results.map((r) => (
                      <ResultCard key={r.model.id} result={r} t={t} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-800">
          {step === "form" ? (
            <>
              <button
                onClick={close}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {t("recommender.cancel")}
              </button>
              <button
                onClick={handleFind}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                {t("recommender.find_button")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
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
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {t("recommender.back")}
              </button>
              {!noResults && (
                <button
                  onClick={handleCompare}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  {t("recommender.compare_button")}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
