import type { PricingStore } from '../types/index';
import { getInitialStore } from '../data/models';

const STORAGE_KEY    = 'llm_pricing_store';
const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

export function loadStore(): PricingStore {
  if (typeof window === 'undefined') return getInitialStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = getInitialStore();
      saveStore(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as PricingStore;
    // Validate minimal shape
    if (!Array.isArray(parsed.models) || !parsed.last_updated) {
      const fresh = getInitialStore();
      saveStore(fresh);
      return fresh;
    }
    // Merge bundled model data so any new fields (e.g. latency) are always present
    const fresh = getInitialStore();
    const freshById = new Map(fresh.models.map(m => [m.id, m]));
    const merged: PricingStore = {
      ...parsed,
      models: parsed.models.map(cached => {
        const base = freshById.get(cached.id);
        return base ? { ...base, ...cached, latency: base.latency } : cached;
      }),
    };
    return merged;
  } catch {
    const fresh = getInitialStore();
    saveStore(fresh);
    return fresh;
  }
}

export function saveStore(store: PricingStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota exceeded or private mode — silently fail
  }
}

export function isStale(store: PricingStore): boolean {
  const updatedAt = new Date(store.last_updated).getTime();
  return Date.now() - updatedAt > STALE_AFTER_MS;
}

export function refreshStore(): PricingStore | null {
  // 10% simulated failure rate (per Phase 4 edge case spec)
  if (Math.random() < 0.1) return null;

  const current = loadStore();

  // Mutate 2–3 random model prices by ±5%
  const indicesToMutate = pickRandom(
    Array.from({ length: current.models.length }, (_, i) => i),
    Math.random() < 0.5 ? 2 : 3
  );

  const updated: PricingStore = {
    ...current,
    last_updated: new Date().toISOString(),
    models: current.models.map((model, idx) => {
      if (!indicesToMutate.includes(idx) || model.is_local) return model;
      const factor = 1 + (Math.random() * 0.10 - 0.05); // ±5%
      return {
        ...model,
        pricing: {
          ...model.pricing,
          input_per_1m:  round6(model.pricing.input_per_1m  * factor),
          output_per_1m: round6(model.pricing.output_per_1m * factor),
        },
      };
    }),
  };

  saveStore(updated);
  return updated;
}

export function formatRelativeTime(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  if (ms < 0) return 'just now';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function round6(n: number): number {
  return Math.round(n * 1_000_000) / 1_000_000;
}
