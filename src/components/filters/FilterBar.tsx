import { useState, useCallback, useMemo } from "react";
import { useI18n } from "../../hooks/useI18n";
import { useAppDispatch, useAppState } from "../../store/appStore";
import { Toggle } from "../ui/Toggle";
import { cn } from "../../lib/utils";
import {
  ALL_PROVIDERS,
  ALL_TYPES,
  ALL_CAPABILITIES,
  PROVIDER_COLORS,
  PROVIDER_LABELS,
  type Provider,
  type ModelType,
  type ModelCapability,
} from "../../types/index";

// ─── Helper: count active filters ─────────────────────────────────────────────
function countActive(
  filters: ReturnType<typeof useAppState>["filters"],
): number {
  return (
    filters.providers.length +
    filters.types.length +
    filters.capabilities.length +
    (filters.search ? 1 : 0) +
    (filters.max_price_per_1m !== null ? 1 : 0) +
    (!filters.show_local ? 1 : 0)
  );
}

function ProviderChip({
  provider,
  selected,
  onToggle,
}: {
  provider: Provider;
  selected: boolean;
  onToggle: () => void;
}) {
  const color = PROVIDER_COLORS[provider];
  return (
    <button
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
      )}
      style={
        selected
          ? { backgroundColor: `${color}22`, borderColor: color, color }
          : {
              borderColor: "transparent",
              backgroundColor: "transparent",
              color: "var(--color-muted)",
            }
      }
    >
      {PROVIDER_LABELS[provider]}
    </button>
  );
}

function TypeChip({
  label,
  selected,
  onToggle,
}: {
  type: ModelType;
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        selected
          ? "bg-indigo-500/10 border-indigo-500 text-indigo-500 dark:text-indigo-400"
          : "border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600",
      )}
    >
      {label}
    </button>
  );
}

export default function FilterBar() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { filters } = useAppState();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const activeCount = useMemo(() => countActive(filters), [filters]);
  const hasActive = activeCount > 0;

  const toggleProvider = useCallback(
    (p: Provider) => {
      const next = filters.providers.includes(p)
        ? filters.providers.filter((x) => x !== p)
        : [...filters.providers, p];
      dispatch({ type: "SET_FILTER", filter: { providers: next } });
    },
    [filters.providers, dispatch],
  );

  const toggleType = useCallback(
    (type: ModelType) => {
      const next = filters.types.includes(type)
        ? filters.types.filter((x) => x !== type)
        : [...filters.types, type];
      dispatch({ type: "SET_FILTER", filter: { types: next } });
    },
    [filters.types, dispatch],
  );

  const toggleCapability = useCallback(
    (cap: ModelCapability) => {
      const next = filters.capabilities.includes(cap)
        ? filters.capabilities.filter((x) => x !== cap)
        : [...filters.capabilities, cap];
      dispatch({ type: "SET_FILTER", filter: { capabilities: next } });
    },
    [filters.capabilities, dispatch],
  );

  const resetAll = useCallback(
    () => dispatch({ type: "RESET_FILTERS" }),
    [dispatch],
  );

  const capabilityLabel = (cap: ModelCapability): string => {
    const key = `models.capabilities.${cap}` as const;
    return t(key);
  };

  const typeLabel = (type: ModelType): string => t(`models.types.${type}`);

  return (
    <div
      id="compare"
      className="sticky top-16 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
        {/* ── Row 1 ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-50">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder={t("filters.search_placeholder")}
              value={filters.search}
              onChange={(e) =>
                dispatch({
                  type: "SET_FILTER",
                  filter: { search: e.target.value },
                })
              }
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Provider chips */}
          <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
            {ALL_PROVIDERS.map((p) => (
              <ProviderChip
                key={p}
                provider={p}
                selected={filters.providers.includes(p)}
                onToggle={() => toggleProvider(p)}
              />
            ))}
          </div>

          {/* Type chips (desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
            {ALL_TYPES.map((type) => (
              <TypeChip
                key={type}
                type={type}
                label={typeLabel(type)}
                selected={filters.types.includes(type)}
                onToggle={() => toggleType(type)}
              />
            ))}
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Reset */}
            {hasActive && (
              <button
                onClick={resetAll}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-500 border border-rose-500/30 hover:bg-rose-500/10 transition-colors"
              >
                {t("filters.reset_filters")}
              </button>
            )}

            {/* Mobile expand toggle */}
            <button
              onClick={() => setMobileExpanded((prev) => !prev)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              {t("filters.more_filters")}
              {activeCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                  {activeCount}
                </span>
              )}
            </button>

            {/* Desktop: "More filters" chevron for row 2 */}
            <button
              onClick={() => setMobileExpanded((prev) => !prev)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              {mobileExpanded
                ? t("filters.hide_filters")
                : t("filters.more_filters")}
              <svg
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  mobileExpanded && "rotate-180",
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
          </div>
        </div>

        {/* ── Row 2 (collapsible) ──────────────────────────────────────────────── */}
        {mobileExpanded && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            {/* Provider chips (mobile) */}
            <div className="sm:hidden flex flex-wrap gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase w-full mb-1">
                {t("filters.provider_filter")}
              </span>
              {ALL_PROVIDERS.map((p) => (
                <ProviderChip
                  key={p}
                  provider={p}
                  selected={filters.providers.includes(p)}
                  onToggle={() => toggleProvider(p)}
                />
              ))}
            </div>

            {/* Type chips (mobile + tablet) */}
            <div className="lg:hidden flex flex-wrap gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase w-full mb-1">
                {t("filters.type_filter")}
              </span>
              {ALL_TYPES.map((type) => (
                <TypeChip
                  key={type}
                  type={type}
                  label={typeLabel(type)}
                  selected={filters.types.includes(type)}
                  onToggle={() => toggleType(type)}
                />
              ))}
            </div>

            {/* Capability checkboxes */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase w-full mb-0">
                {t("filters.capability_filter")}
              </span>
              {ALL_CAPABILITIES.map((cap) => {
                const selected = filters.capabilities.includes(cap);
                return (
                  <button
                    key={cap}
                    onClick={() => toggleCapability(cap)}
                    role="checkbox"
                    aria-checked={selected}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                      selected
                        ? "bg-violet-500/10 border-violet-500 text-violet-500 dark:text-violet-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400",
                    )}
                  >
                    {selected && (
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {capabilityLabel(cap)}
                  </button>
                );
              })}
            </div>

            {/* Max price slider */}
            <div className="flex flex-col gap-1.5 min-w-55">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  {t("filters.max_price")}
                </span>
                <span className="text-xs font-mono text-indigo-500">
                  {filters.max_price_per_1m !== null
                    ? `$${filters.max_price_per_1m.toFixed(2)}`
                    : "Any"}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={75}
                step={0.5}
                value={filters.max_price_per_1m ?? 75}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  dispatch({
                    type: "SET_FILTER",
                    filter: { max_price_per_1m: val >= 75 ? null : val },
                  });
                }}
                className="w-full h-1.5 appearance-none bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>$0</span>
                <span>$75+</span>
              </div>
            </div>

            {/* Show local toggle */}
            <Toggle
              checked={filters.show_local}
              onChange={(v) =>
                dispatch({ type: "SET_FILTER", filter: { show_local: v } })
              }
              label={t("filters.show_local")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
