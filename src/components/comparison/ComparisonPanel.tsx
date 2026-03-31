import { useState, useMemo } from "react";
import { useAppState, useAppDispatch } from "../../store/appStore";
import { useI18n } from "../../hooks/useI18n";
import {
  calculateCost,
  rankModels,
  type UsageParams,
  type CostBreakdown,
} from "../../lib/calculator";
import { cn } from "../../lib/utils";
import { PROVIDER_COLORS, PROVIDER_LABELS } from "../../types/index";
import ComparisonTable from "./ComparisonTable";
import SubscriptionComparison from "./SubscriptionComparison";
import UsageCalculator from "../calculator/UsageCalculator";
import CostBarChart from "../charts/CostBarChart";
import MonthlyCostChart from "../charts/MonthlyCostChart";

// ─── Section wrapper with collapsible ────────────────────────────────────────
function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-900 dark:text-white text-sm">
          {title}
        </span>
        <svg
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="px-5 py-5 bg-white dark:bg-slate-900">{children}</div>
      )}
    </div>
  );
}

// ─── Main panel ──────────────────────────────────────────────────────────────
export default function ComparisonPanel() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { pricingStore, selectedModels } = useAppState();

  const [usage, setUsage] = useState<UsageParams>({
    messages_per_day: 50,
    avg_input_tokens: 300,
    avg_output_tokens: 500,
    days_per_month: 30,
  });

  const models = useMemo(
    () => pricingStore.models.filter((m) => selectedModels.includes(m.id)),
    [pricingStore.models, selectedModels],
  );

  const breakdowns = useMemo<CostBreakdown[]>(() => {
    if (!models.length) return [];
    return rankModels(models.map((m) => calculateCost(m, usage)));
  }, [models, usage]);

  // Cheapest subscription tier across selected models (for reference line)
  const refSubscription = useMemo(() => {
    for (const m of models) {
      if (m.subscription_tiers?.length) {
        const cheapest = m.subscription_tiers.reduce((a, b) =>
          b.price_monthly < a.price_monthly ? b : a,
        );
        return {
          monthly: cheapest.price_monthly,
          name: `${m.name} ${cheapest.name}`,
        };
      }
    }
    return null;
  }, [models]);

  const hasSubscriptions = models.some(
    (m) => (m.subscription_tiers?.length ?? 0) > 0,
  );

  return (
    <div id="calculator" className="w-full">
      {selectedModels.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center gap-3 text-center">
          <svg
            className="w-12 h-12 text-slate-300 dark:text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
            {t("comparison.empty_title")}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("comparison.empty_hint")}
          </p>
        </div>
      )}
      {selectedModels.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-4">
          {/* ─── Panel header ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t("comparison.title")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedModels.length}{" "}
                {selectedModels.length === 1
                  ? t("selection.count")
                  : t("selection.count_plural")}
              </p>
            </div>
          </div>

          {/* ─── Selected models strip ─────────────────────────────────── */}
          <div className="flex gap-2 flex-wrap">
            {models.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: PROVIDER_COLORS[m.provider] }}
                />
                <span className="text-slate-800 dark:text-slate-200 font-medium leading-none">
                  {m.name}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {PROVIDER_LABELS[m.provider]}
                </span>
                <button
                  onClick={() => dispatch({ type: "DESELECT_MODEL", id: m.id })}
                  aria-label={`Remove ${m.name}`}
                  className="ml-0.5 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <svg
                    className="w-3 h-3"
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
            ))}
          </div>

          {/* ─── Side-by-side table ────────────────────────────────────── */}
          <Section title={t("comparison.title")}>
            <ComparisonTable models={models} breakdowns={breakdowns} />
          </Section>

          {/* ─── Charts: two columns on desktop ────────────────────────── */}
          {models.length >= 2 && (
            <Section
              title={`${t("chart.cost_bar_title")} & ${t("chart.monthly_cost_title")}`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("chart.cost_bar_title")}
                  </h3>
                  <CostBarChart breakdowns={breakdowns} models={models} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("chart.monthly_cost_title")}
                  </h3>
                  <MonthlyCostChart
                    breakdowns={breakdowns}
                    models={models}
                    subscriptionMonthly={refSubscription?.monthly}
                    subscriptionName={refSubscription?.name}
                  />
                </div>
              </div>
            </Section>
          )}

          {/* ─── Usage Calculator ──────────────────────────────────────── */}
          <Section
            title={`${t("calculator.title")} — ${t("calculator.subtitle")}`}
          >
            <UsageCalculator
              onUsageChange={setUsage}
              showSubscriptionToggle={false}
            />
          </Section>

          {/* ─── Subscription comparison ───────────────────────────────── */}
          {hasSubscriptions && (
            <Section title={t("subscription.title")} defaultOpen={false}>
              <SubscriptionComparison breakdowns={breakdowns} models={models} />
            </Section>
          )}
        </div>
      )}
    </div>
  );
}
