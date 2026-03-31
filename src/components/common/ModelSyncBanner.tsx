import { useState, useEffect } from 'react';
import { useBackendSync } from '../../store/appStore';
import { useI18n } from '../../hooks/useI18n';
import { Spinner } from '../ui/Spinner';

function formatRelativeTime(
  ts: number | null,
  t: (key: string) => string,
): string {
  if (ts === null) return t('sync_banner.never');
  const diff = Date.now() - ts;
  const min  = Math.floor(diff / 60_000);
  const hr   = Math.floor(diff / 3_600_000);
  const day  = Math.floor(diff / 86_400_000);
  if (diff < 60_000)  return t('sync_banner.just_now');
  if (min  < 60)      return `${min} ${t('sync_banner.minutes_ago')}`;
  if (hr   < 24)      return `${hr} ${t('sync_banner.hours_ago')}`;
  return `${day} ${t('sync_banner.days_ago')}`;
}

export default function ModelSyncBanner() {
  const { t } = useI18n();
  const { isSyncingBackend, lastBackendSync, triggerSync } = useBackendSync();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const relativeTime = mounted
    ? formatRelativeTime(lastBackendSync, t)
    : t('sync_banner.never');

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-400">
      <div className="flex items-center gap-1.5">
        {/* Clock icon */}
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          {t('sync_banner.last_updated')}:{' '}
          <strong>{relativeTime}</strong>
        </span>
      </div>

      <button
        onClick={triggerSync}
        disabled={isSyncingBackend}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        aria-label={t('sync_banner.update_button')}
      >
        {isSyncingBackend ? (
          <>
        <Spinner size="sm" />
            {t('sync_banner.updating')}
          </>
        ) : (
          <>
            {/* Refresh icon */}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('sync_banner.update_button')}
          </>
        )}
      </button>
    </div>
  );
}
