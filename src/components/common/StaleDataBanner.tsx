import { useState } from "react";
import { useAppState, useAppDispatch } from "../../store/appStore";
import { isStale, refreshStore } from "../../lib/storage";
import { useI18n } from "../../hooks/useI18n";
import { Spinner } from "../ui/Spinner";

export default function StaleDataBanner() {
  const { t } = useI18n();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<
    "idle" | "refreshing" | "success" | "error"
  >("idle");

  if (!isStale(state.pricingStore) && status === "idle") return null;
  if (status === "success") return null;

  function handleRefresh() {
    setStatus("refreshing");
    dispatch({ type: "SET_REFRESHING", value: true });

    const updated = refreshStore();

    dispatch({ type: "SET_REFRESHING", value: false });

    if (!updated) {
      setStatus("error");
      dispatch({
        type: "ADD_TOAST",
        toast: {
          type: "error",
          message: t("stale_banner.error"),
          duration: 5000,
        },
      });
      setTimeout(() => setStatus("idle"), 5000);
    } else {
      dispatch({ type: "SET_STORE", store: updated });
      setStatus("success");
      dispatch({
        type: "ADD_TOAST",
        toast: {
          type: "success",
          message: t("stale_banner.success"),
          duration: 4000,
        },
      });
    }
  }

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border-y border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
    >
      <div className="flex items-center gap-2 text-sm">
        {/* Warning icon */}
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        {status === "error"
          ? t("stale_banner.error")
          : status === "refreshing"
            ? t("stale_banner.refreshing")
            : t("stale_banner.title")}
      </div>

      {status !== "error" && (
        <button
          onClick={handleRefresh}
          disabled={status === "refreshing"}
          className="flex items-center gap-1.5 shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "refreshing" ? (
            <>
              <Spinner size="sm" />
              {t("stale_banner.refreshing")}
            </>
          ) : (
            t("stale_banner.cta")
          )}
        </button>
      )}
    </div>
  );
}
