// ─── Class name helper ────────────────────────────────────────────────────────
type ClassValue = string | undefined | null | false | 0;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Number / currency formatting ─────────────────────────────────────────────
export function formatNumber(n: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(n);
}

export function formatCurrency(usd: number): string {
  if (usd === 0) return 'FREE';
  if (usd < 0.001) return `$${usd.toFixed(6)}`;
  if (usd < 0.01)  return `$${usd.toFixed(5)}`;
  if (usd < 1)     return `$${usd.toFixed(4)}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd);
}

// ─── Relative time helper ──────────────────────────────────────────────────────
export function formatRelativeTime(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  if (ms < 0) return 'just now';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60)  return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)  return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

// ─── Large number abbreviation ────────────────────────────────────────────────
export function abbreviateCost(usd: number): string {
  if (usd === 0) return 'FREE';
  if (usd >= 1000) return `~$${(usd / 1000).toFixed(1)}K`;
  return formatCurrency(usd);
}
