import { useState, useMemo } from "react";
import { useAppState } from "../../store/appStore";
import { useI18n } from "../../hooks/useI18n";
import {
  calculateCost,
  rankModels,
  formatCostDisplay,
  getDefaultUsageProfiles,
  type UsageParams,
  type CostBreakdown,
} from "../../lib/calculator";
import { PROVIDER_COLORS, PROVIDER_LABELS } from "../../types/index";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/Badge";

interface UsageCalculatorProps {
  onUsageChange?: (params: UsageParams) => void;
  showSubscriptionToggle?: boolean;
}

export default function UsageCalculator({
  onUsageChange,
  showSubscriptionToggle = true,
}: UsageCalculatorProps) {
  const { t } = useI18n();
  const { pricingStore, selectedModels } = useAppState();
  const profiles = getDefaultUsageProfiles();

  const [activePreset, setActivePreset] = useState<number>(1); // Medium default
  const [usage, setUsage] = useState<UsageParams>(profiles[1].params);
  const [showSubs, setShowSubs] = useState(false);

  const models = useMemo(
    () => pricingStore.models.filter((m) => selectedModels.includes(m.id)),
    [pricingStore.models, selectedModels],
  );

  const breakdowns = useMemo<CostBreakdown[]>(() => {
    if (!models.length) return [];
    return rankModels(models.map((m) => calculateCost(m, usage)));
  }, [models, usage]);

  const mostExpensive = breakdowns.length
    ? breakdowns[breakdowns.length - 1].monthly_cost
    : 0;

  function applyPreset(idx: number) {
    setActivePreset(idx);
    const params = profiles[idx].params;
    setUsage(params);
    onUsageChange?.(params);
  }

  function updateUsage(patch: Partial<UsageParams>) {
    setActivePreset(-1);
    const next = { ...usage, ...patch };
    setUsage(next);
    onUsageChange?.(next);
  }

  const monthlyIn = (
    usage.messages_per_day *
    usage.avg_input_tokens *
    usage.days_per_month
  ).toLocaleString();
  const monthlyOut = (
    usage.messages_per_day *
    usage.avg_output_tokens *
    usage.days_per_month
  ).toLocaleString();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ─── LEFT: Inputs ────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Your Usage Profile
          </h3>

          {/* Presets */}
          <div className="flex gap-2 mb-5">
            {profiles.map((p, i) => (
              <button
                key={p.key}
                onClick={() => applyPreset(i)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150",
                  activePreset === i
                    ? "bg-indigo-500 border-indigo-500 text-white shadow-sm"
                    : "bg-transparent border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400",
                )}
              >
                {t(p.key)}
              </button>
            ))}
          </div>

          {/* Slider: messages/day */}
          <SliderRow
            label={t("calculator.messages_per_day")}
            value={usage.messages_per_day}
            min={1}
            max={1000}
            step={1}
            onChange={(v) => updateUsage({ messages_per_day: v })}
            display={usage.messages_per_day.toLocaleString()}
          />

          {/* Slider: avg input tokens */}
          <SliderRow
            label={t("calculator.avg_input_tokens")}
            value={usage.avg_input_tokens}
            min={50}
            max={5000}
            step={50}
            onChange={(v) => updateUsage({ avg_input_tokens: v })}
            display={usage.avg_input_tokens.toLocaleString()}
          />

          {/* Slider: avg output tokens */}
          <SliderRow
            label={t("calculator.avg_output_tokens")}
            value={usage.avg_output_tokens}
            min={50}
            max={5000}
            step={50}
            onChange={(v) => updateUsage({ avg_output_tokens: v })}
            display={usage.avg_output_tokens.toLocaleString()}
          />
        </div>

        {/* Monthly token summary */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>{t("calculator.monthly_input")}</span>
            <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
              {monthlyIn} tokens
            </span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>{t("calculator.monthly_output")}</span>
            <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
              {monthlyOut} tokens
            </span>
          </div>
        </div>

        {/* Show subscriptions toggle */}
        {showSubscriptionToggle && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              role="switch"
              aria-checked={showSubs}
              onClick={() => setShowSubs((v) => !v)}
              className={cn(
                "relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer",
                showSubs ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
                  showSubs && "translate-x-5",
                )}
              />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {t("calculator.show_subscriptions")}
            </span>
          </label>
        )}
      </div>

      {/* ─── RIGHT: Results ───────────────────────────────────────────── */}
      <div className="space-y-3">
        {breakdowns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-40 text-center text-slate-400 dark:text-slate-500 text-sm gap-2">
            <svg
              className="w-8 h-8 opacity-40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {t("calculator.empty_hint")}
          </div>
        ) : (
          breakdowns.map((bd, i) => {
            const model = models.find((m) => m.id === bd.model_id)!;
            const isFirst = i === 0;
            const savings = mostExpensive - bd.monthly_cost;
            const providerColor = PROVIDER_COLORS[model.provider];

            return (
              <div
                key={bd.model_id}
                className={cn(
                  "rounded-xl border p-4 transition-all duration-200",
                  isFirst
                    ? "border-emerald-400/50 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30",
                )}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: providerColor }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm truncate leading-tight">
                        {model.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {PROVIDER_LABELS[model.provider]}
                      </p>
                    </div>
                  </div>

                  {isFirst && (
                    <Badge color="#10b981" variant="solid">
                      {t("calculator.best_value_badge")}
                    </Badge>
                  )}
                </div>

                {/* Cost */}
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p
                      className={cn(
                        "text-3xl font-mono font-bold tabular-nums leading-none",
                        bd.is_free
                          ? "text-emerald-500"
                          : "text-indigo-400 dark:text-indigo-300",
                      )}
                    >
                      {bd.is_free ? "FREE" : formatCostDisplay(bd.monthly_cost)}
                    </p>
                    {!bd.is_free && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {t("calculator.monthly_cost")}
                      </p>
                    )}
                  </div>

                  {!bd.is_free && savings > 0 && !isFirst && (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-right">
                      +{formatCostDisplay(savings)}/mo
                    </p>
                  )}
                  {!bd.is_free &&
                    savings > 0.001 &&
                    isFirst &&
                    breakdowns.length > 1 && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium text-right">
                        Save {formatCostDisplay(savings)}/mo
                      </p>
                    )}
                </div>

                {/* Annual estimate */}
                {!bd.is_free && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                    {t("calculator.annual_cost")}:{" "}
                    <span className="tabular-nums">
                      {formatCostDisplay(bd.annual_cost)}
                    </span>
                  </p>
                )}

                {/* Break-even callout */}
                {bd.subscription_break_even_msgs != null &&
                  bd.subscription_monthly != null &&
                  showSubs && (
                    <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                      {t("calculator.subscription_hint")
                        .replace("{name}", bd.subscription_name ?? "")
                        .replace(
                          "{msgs}",
                          Math.ceil(
                            bd.subscription_break_even_msgs,
                          ).toLocaleString(),
                        )}
                    </div>
                  )}

                {/* Self-hosted note */}
                {bd.is_free && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Infrastructure costs not included
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Slider row sub-component ─────────────────────────────────────────────────
function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm text-slate-600 dark:text-slate-400">
          {label}
        </label>
        <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-slate-200 dark:bg-slate-700 accent-indigo-500 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
