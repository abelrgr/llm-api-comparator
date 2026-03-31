import { useState, useMemo } from "react";
import { useAppDispatch } from "../../store/appStore";
import { useI18n } from "../../hooks/useI18n";
import { formatCostDisplay } from "../../lib/calculator";
import type { CostBreakdown } from "../../lib/calculator";
import type { LLMModel, ModelCapability } from "../../types/index";
import { PROVIDER_COLORS, PROVIDER_LABELS } from "../../types/index";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/Badge";

interface ComparisonTableProps {
  models: LLMModel[];
  breakdowns: CostBreakdown[];
}

type SortKey =
  | "none"
  | "monthly_cost"
  | "input_price"
  | "output_price"
  | "context";

const ALL_CAPS: ModelCapability[] = [
  "vision",
  "function_calling",
  "streaming",
  "fine_tuning",
  "long_context",
  "code",
  "reasoning",
];

export default function ComparisonTable({
  models,
  breakdowns,
}: ComparisonTableProps) {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const [sortKey, setSortKey] = useState<SortKey>("none");
  const [copied, setCopied] = useState(false);

  const bdMap = useMemo(
    () => Object.fromEntries(breakdowns.map((b) => [b.model_id, b])),
    [breakdowns],
  );

  const sorted = useMemo(() => {
    if (sortKey === "none") return models;
    return [...models].sort((a, b) => {
      if (sortKey === "monthly_cost") {
        return (
          (bdMap[a.id]?.monthly_cost ?? Infinity) -
          (bdMap[b.id]?.monthly_cost ?? Infinity)
        );
      }
      if (sortKey === "input_price")
        return a.pricing.input_per_1m - b.pricing.input_per_1m;
      if (sortKey === "output_price")
        return a.pricing.output_per_1m - b.pricing.output_per_1m;
      if (sortKey === "context")
        return b.pricing.context_window - a.pricing.context_window;
      return 0;
    });
  }, [models, sortKey, bdMap]);

  const cheapestId = breakdowns.length
    ? breakdowns.reduce((a, b) => (a.monthly_cost < b.monthly_cost ? a : b))
        .model_id
    : null;
  const mostExpensive = breakdowns.length
    ? breakdowns.reduce((a, b) => (a.monthly_cost > b.monthly_cost ? a : b))
        .model_id
    : null;

  function copyLink() {
    const ids = models.map((m) => m.id).join(",");
    const url = `${window.location.origin}${window.location.pathname}#compare=${ids}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function clearAll() {
    dispatch({ type: "CLEAR_SELECTION" });
  }

  function exportCsv() {
    const headers = [
      "Model",
      "Provider",
      "Input $/1M",
      "Output $/1M",
      "Context Window",
      "Monthly Cost (est.)",
      "Capabilities",
    ];
    const rows = sorted.map((m) => {
      const bd = bdMap[m.id];
      return [
        m.name,
        m.provider,
        m.pricing.input_per_1m.toFixed(4),
        m.pricing.output_per_1m.toFixed(4),
        m.pricing.context_window.toLocaleString(),
        bd ? bd.monthly_cost.toFixed(2) : "",
        m.capabilities.join("; "),
      ];
    });
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `llm-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    return (
      <button
        onClick={() => setSortKey((prev) => (prev === k ? "none" : k))}
        className={cn(
          "text-xs font-medium flex items-center gap-1 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors",
          sortKey === k
            ? "text-indigo-500 dark:text-indigo-400"
            : "text-slate-500 dark:text-slate-400",
        )}
      >
        {label}
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
            d={sortKey === k ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Action bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{t("comparison.sort_by")}:</span>
          <SortBtn k="monthly_cost" label={t("comparison.monthly_at_usage")} />
          <SortBtn k="input_price" label={t("common.input")} />
          <SortBtn k="output_price" label={t("common.output")} />
          <SortBtn k="context" label={t("comparison.context")} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            title="Download comparison as CSV"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            Export CSV
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
          >
            {copied ? (
              <>
                <svg
                  className="w-3.5 h-3.5 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {t("comparison.copied")}
              </>
            ) : (
              <>
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
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                {t("comparison.copy_link")}
              </>
            )}
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            {t("comparison.clear")}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              {/* Sticky label column */}
              <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap border-r border-slate-200 dark:border-slate-700 min-w-[120px]">
                {t("comparison.provider")}
              </th>
              {sorted.map((m) => (
                <th
                  key={m.id}
                  className={cn(
                    "px-4 py-3 min-w-[140px] text-center font-semibold text-slate-900 dark:text-white",
                    m.id === cheapestId &&
                      "bg-emerald-50/80 dark:bg-emerald-950/20",
                    m.id === mostExpensive &&
                      !m.is_local &&
                      "bg-rose-50/80 dark:bg-rose-950/20",
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: PROVIDER_COLORS[m.provider] }}
                    />
                    <span className="text-xs leading-tight">{m.name}</span>
                    {m.id === cheapestId && (
                      <Badge color="#10b981" variant="solid">
                        {t("calculator.best_value_badge")}
                      </Badge>
                    )}
                    <button
                      onClick={() =>
                        dispatch({ type: "DESELECT_MODEL", id: m.id })
                      }
                      aria-label={`Remove ${m.name}`}
                      title={`Remove ${m.name}`}
                      className="mt-0.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-all duration-150"
                    >
                      <svg
                        className="w-2.5 h-2.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* ── Provider row ── */}
            <Row label={t("comparison.provider")} tooltip={t("comparison.tooltips.provider")} odd>
              {sorted.map((m) => (
                <td
                  key={m.id}
                  className={cellCls(
                    m.id,
                    cheapestId,
                    mostExpensive,
                    m.is_local,
                    true,
                  )}
                >
                  <div className="text-center">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {PROVIDER_LABELS[m.provider]}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      {m.release_date}
                    </div>
                  </div>
                </td>
              ))}
            </Row>

            {/* ── Input pricing ── */}
            <Row label={`${t("common.input")} / 1M`} tooltip={t("comparison.tooltips.input_1m")}>
              {sorted.map((m) => (
                <td
                  key={m.id}
                  className={cellCls(
                    m.id,
                    cheapestId,
                    mostExpensive,
                    m.is_local,
                  )}
                >
                  <span className="font-mono tabular-nums">
                    {m.is_local ? "—" : `$${m.pricing.input_per_1m}`}
                  </span>
                </td>
              ))}
            </Row>

            {/* ── Output pricing ── */}
            <Row label={`${t("common.output")} / 1M`} tooltip={t("comparison.tooltips.output_1m")} odd>
              {sorted.map((m) => (
                <td
                  key={m.id}
                  className={cellCls(
                    m.id,
                    cheapestId,
                    mostExpensive,
                    m.is_local,
                    true,
                  )}
                >
                  <span className="font-mono tabular-nums">
                    {m.is_local ? "—" : `$${m.pricing.output_per_1m}`}
                  </span>
                </td>
              ))}
            </Row>

            {/* ── Context window ── */}
            <Row label={t("comparison.context")} tooltip={t("comparison.tooltips.context")}>
              {sorted.map((m) => (
                <td
                  key={m.id}
                  className={cellCls(
                    m.id,
                    cheapestId,
                    mostExpensive,
                    m.is_local,
                  )}
                >
                  <span className="font-mono tabular-nums text-xs">
                    {(m.pricing.context_window / 1000).toFixed(0)}K
                  </span>
                </td>
              ))}
            </Row>

            {/* ── Capabilities ── */}
            {ALL_CAPS.map((cap, i) => (
              <Row
                key={cap}
                label={t(`models.capabilities.${cap}`)}
                tooltip={t(`comparison.tooltips.${cap}`)}
                odd={i % 2 === 1}
              >
                {sorted.map((m) => (
                  <td
                    key={m.id}
                    className={cellCls(
                      m.id,
                      cheapestId,
                      mostExpensive,
                      m.is_local,
                      i % 2 === 1,
                    )}
                  >
                    {m.capabilities.includes(cap) ? (
                      <svg
                        className="w-4 h-4 text-emerald-500 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-label="Yes"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600 mx-auto block text-center">
                        —
                      </span>
                    )}
                  </td>
                ))}
              </Row>
            ))}

            {/* ── Monthly cost at usage ── */}
            <Row label={t("comparison.monthly_at_usage")} tooltip={t("comparison.tooltips.monthly_at_usage")} highlight>
              {sorted.map((m) => {
                const bd = bdMap[m.id];
                return (
                  <td
                    key={m.id}
                    className={cellCls(
                      m.id,
                      cheapestId,
                      mostExpensive,
                      m.is_local,
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono font-bold tabular-nums text-sm",
                        m.is_local || bd?.is_free
                          ? "text-emerald-500"
                          : m.id === cheapestId
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-indigo-500 dark:text-indigo-300",
                      )}
                    >
                      {bd
                        ? bd.is_free
                          ? "FREE"
                          : formatCostDisplay(bd.monthly_cost)
                        : "—"}
                    </span>
                  </td>
                );
              })}
            </Row>

            {/* ── Subscription ── */}
            <Row label={t("comparison.subscription")} tooltip={t("comparison.tooltips.subscription")} odd>
              {sorted.map((m) => (
                <td
                  key={m.id}
                  className={cellCls(
                    m.id,
                    cheapestId,
                    mostExpensive,
                    m.is_local,
                    true,
                  )}
                >
                  {m.subscription_tiers ? (
                    <div className="text-xs text-slate-600 dark:text-slate-300 text-center">
                      ${m.subscription_tiers[0].price_monthly}/mo
                      {m.subscription_tiers[0].is_popular && (
                        <span className="ml-1 text-indigo-400">★</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600 block text-center">
                      —
                    </span>
                  )}
                </td>
              ))}
            </Row>

            {/* ── Source link ── */}
            <Row label={t("comparison.source")} tooltip={t("comparison.tooltips.source")}>
              {sorted.map((m) => (
                <td
                  key={m.id}
                  className={cellCls(
                    m.id,
                    cheapestId,
                    mostExpensive,
                    m.is_local,
                  )}
                >
                  <a
                    href={m.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 dark:text-indigo-400 hover:underline text-xs mx-auto block text-center"
                  >
                    Pricing ↗
                  </a>
                </td>
              ))}
            </Row>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Row wrapper ──────────────────────────────────────────────────────────────
function Row({
  label,
  tooltip,
  odd,
  highlight,
  children,
}: {
  label: string;
  tooltip?: string;
  odd?: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <tr
      className={cn(
        "border-b border-slate-100 dark:border-slate-800",
        highlight && "bg-indigo-50/30 dark:bg-indigo-950/10",
        !highlight && odd && "bg-slate-50/50 dark:bg-slate-800/20",
      )}
    >
      <td className="sticky left-0 z-10 px-4 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap border-r border-slate-200 dark:border-slate-700 bg-inherit">
        <span className="flex items-center gap-1">
          {label}
          {tooltip && (
            <span className="relative group/tooltip inline-flex items-center">
              <svg
                className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-help shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 w-52 rounded-lg bg-slate-900 dark:bg-slate-700 px-3 py-2 text-[11px] text-white leading-snug shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 z-[9999] normal-case font-normal whitespace-normal">
                {tooltip}
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-700" />
              </span>
            </span>
          )}
        </span>
      </td>
      {children}
    </tr>
  );
}

function cellCls(
  id: string,
  cheapestId: string | null,
  mostExpensive: string | null,
  isLocal: boolean,
  odd?: boolean,
): string {
  return cn(
    "px-4 py-2.5 text-center align-middle",
    id === cheapestId && "bg-emerald-50/60 dark:bg-emerald-950/15",
    id === mostExpensive && !isLocal && "bg-rose-50/60 dark:bg-rose-950/15",
    !id && odd && "bg-slate-50/50 dark:bg-slate-800/20",
  );
}
