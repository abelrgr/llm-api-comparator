import type { LLMModel, PricingStore } from '../types/index';

const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
const CACHE_KEY = 'llm_backend_sync_at';
const CACHE_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export interface BackendModelsResponse {
  success: boolean;
  data: {
    models: RawBackendModel[];
    last_updated: string;
    version: number;
  };
}

interface RawBackendModel {
  id: string;
  name: string;
  provider: string;
  type: string;
  capabilities: string[];
  pricing: Record<string, number>;
  latency: Record<string, number | null>;
  tiersJson?: string | null;
  snippet_js?: string | null;
  is_local: boolean;
  description: string;
  release_date: string;
  deprecated: boolean;
  source_url: string;
}

function toStoredModel(raw: RawBackendModel): LLMModel {
  return {
    id: raw.id,
    name: raw.name,
    provider: raw.provider as LLMModel['provider'],
    type: raw.type as LLMModel['type'],
    capabilities: raw.capabilities as LLMModel['capabilities'],
    pricing: {
      input_per_1m: raw.pricing.input_per_1m ?? 0,
      output_per_1m: raw.pricing.output_per_1m ?? 0,
      context_window: raw.pricing.context_window ?? 0,
      max_output: raw.pricing.max_output,
    },
    latency: {
      ttft_ms: raw.latency.ttft_ms ?? null,
      tps: raw.latency.tps ?? null,
    },
    snippet_js: raw.snippet_js ?? undefined,
    is_local: raw.is_local,
    description: raw.description,
    release_date: raw.release_date,
    deprecated: raw.deprecated,
    source_url: raw.source_url,
  };
}

/** Fetch models from the backend and return a PricingStore. */
export async function fetchModelsFromBackend(): Promise<PricingStore> {
  const res = await fetch(`${BACKEND_URL}/llm-models`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}: ${res.statusText}`);
  }

  const json = (await res.json()) as BackendModelsResponse;

  if (!json.success || !json.data?.models) {
    throw new Error('Unexpected backend response shape');
  }

  return {
    models: json.data.models.map(toStoredModel),
    last_updated: json.data.last_updated,
    version: json.data.version,
  };
}

/** Returns true when the backend cache should be refreshed (first visit or > 3 days old). */
export function isBackendCacheStale(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return true;
  const fetchedAt = parseInt(raw, 10);
  if (isNaN(fetchedAt)) return true;
  return Date.now() - fetchedAt > CACHE_TTL_MS;
}

/** Timestamp (ms) of the last successful backend fetch, or null. */
export function getLastBackendFetch(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  const t = parseInt(raw, 10);
  return isNaN(t) ? null : t;
}

/** Persist the current timestamp as the last backend fetch time. */
export function markBackendFetched(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CACHE_KEY, String(Date.now()));
}
