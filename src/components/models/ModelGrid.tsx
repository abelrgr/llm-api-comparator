import {
  useAppState,
  useAppDispatch,
  useFilteredModels,
} from "../../store/appStore";
import { getBestValueModel, getMostCapableModel } from "../../data/models";
import { useI18n } from "../../hooks/useI18n";
import ModelCard from "./ModelCard";

function SkeletonCard() {
  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md dark:shadow-lg dark:shadow-black/40 animate-pulse">
      {/* color bar */}
      <div className="h-1 w-full bg-slate-200 dark:bg-slate-700" />
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* provider badge + title */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-5 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-1/2 rounded-lg bg-slate-100 dark:bg-slate-700/60" />
          </div>
          <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
        </div>
        {/* price row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-700/50" />
          <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-700/50" />
        </div>
        {/* context window */}
        <div className="h-8 rounded-lg bg-slate-100 dark:bg-slate-700/50" />
        {/* capability badges */}
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ModelGrid() {
  const { t } = useI18n();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const filtered = useFilteredModels();

  const models = state.pricingStore.models;
  const bestValue = getBestValueModel(models)?.id ?? null;
  const mostCapable = getMostCapableModel(models)?.id ?? null;
  const isMaxReached = state.selectedModels.length >= 6;

  function toggle(modelId: string) {
    if (state.selectedModels.includes(modelId)) {
      dispatch({ type: "DESELECT_MODEL", id: modelId });
    } else {
      dispatch({ type: "SELECT_MODEL", id: modelId });
    }
  }

  return (
    <section
      id="models"
      className="px-4 sm:px-6 lg:px-8 py-10 max-w-screen-2xl mx-auto"
    >
      {/* Results count */}
      {filtered.length > 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {filtered.length} {filtered.length === 1 ? "model" : "models"} found
        </p>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
          <svg
            className="w-16 h-16 text-slate-300 dark:text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              {t("models.no_results")}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("models.no_results_hint")}
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: "RESET_FILTERS" })}
            className="mt-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            {t("filters.reset_filters")}
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {state.isRefreshing
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((model, idx) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isSelected={state.selectedModels.includes(model.id)}
                  isBestValue={model.id === bestValue}
                  isMostCapable={model.id === mostCapable}
                  isMaxReached={isMaxReached}
                  onToggle={() => toggle(model.id)}
                  animDelay={idx * 50}
                />
              ))}
        </div>
      )}

      {/* ── Sticky bottom selection banner (mobile) ────────────────────────── */}
      {state.selectedModels.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-700 shadow-lg lg:hidden safe-area-inset-bottom">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {state.selectedModels.length === 1
                  ? t("selection.count").replace("{count}", "1")
                  : t("selection.count_plural").replace(
                      "{count}",
                      String(state.selectedModels.length),
                    )}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t("selection.max_reached_hint")}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium py-1 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                {t("selection.clear_all")}
              </button>
              <a
                href="#calculator"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                {t("selection.compare_button")} →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky top selection banner (desktop) ─────────────────────────── */}
      {state.selectedModels.length > 0 && (
        <div className="hidden lg:block fixed top-16 left-0 right-0 z-40 px-6 py-2 bg-indigo-600/95 backdrop-blur shadow-md shadow-indigo-900/30">
          <div className="flex items-center justify-between gap-4 max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-semibold text-white shrink-0">
                {state.selectedModels.length === 1
                  ? t("selection.count").replace("{count}", "1")
                  : t("selection.count_plural").replace(
                      "{count}",
                      String(state.selectedModels.length),
                    )}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-h-7">
                {state.selectedModels.map((id) => {
                  const m = state.pricingStore.models.find((x) => x.id === id);
                  return m ? (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white"
                    >
                      {m.name}
                      <button
                        aria-label={`Remove ${m.name}`}
                        onClick={() => dispatch({ type: "DESELECT_MODEL", id })}
                        className="hover:text-indigo-200 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
                className="text-xs text-indigo-200 hover:text-white font-medium py-1 px-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {t("selection.clear_all")}
              </button>
              <a
                href="#calculator"
                className="px-4 py-1.5 rounded-lg bg-white text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap"
              >
                {t("selection.compare_button")} ↓
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
