import type { LLMModel, ModelCapability } from '../types/index';

export type RecommenderPriority = 'cheapest' | 'most_capable' | 'balanced' | 'fastest';

export interface RecommenderParams {
  priority: RecommenderPriority;
  required_capabilities: ModelCapability[];
  max_input_price: number | null;   // $/1M input tokens
  min_context_window: number | null; // tokens
  include_local: boolean;
}

export interface RecommenderResult {
  model: LLMModel;
  score: number;        // 0–100
  rank: 1 | 2 | 3;
  scores: {
    cost:       number;
    capability: number;
    latency:    number;
    context:    number;
  };
}

const WEIGHTS: Record<RecommenderPriority, { cost: number; capability: number; latency: number; context: number }> = {
  cheapest:      { cost: 0.65, capability: 0.20, latency: 0.10, context: 0.05 },
  most_capable:  { cost: 0.15, capability: 0.55, latency: 0.10, context: 0.20 },
  balanced:      { cost: 0.35, capability: 0.35, latency: 0.15, context: 0.15 },
  fastest:       { cost: 0.25, capability: 0.15, latency: 0.55, context: 0.05 },
};

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 100;
  return ((value - min) / (max - min)) * 100;
}

export function getRecommendations(
  models: LLMModel[],
  params: RecommenderParams,
): RecommenderResult[] {
  // ── Hard filters ──────────────────────────────────────────────────────────
  let pool = models.filter(m => {
    if (m.deprecated) return false;
    if (!params.include_local && m.is_local) return false;
    if (params.required_capabilities.length) {
      if (!params.required_capabilities.every(cap => m.capabilities.includes(cap))) return false;
    }
    if (params.max_input_price !== null && !m.is_local) {
      if (m.pricing.input_per_1m > params.max_input_price) return false;
    }
    if (params.min_context_window !== null) {
      if (m.pricing.context_window < params.min_context_window) return false;
    }
    return true;
  });

  if (pool.length === 0) return [];

  // ── Compute raw dimension values ──────────────────────────────────────────
  const blendedPrices   = pool.map(m => m.is_local ? 0 : (m.pricing.input_per_1m + m.pricing.output_per_1m) / 2);
  const capCounts       = pool.map(m => m.capabilities.length);
  const ttfts           = pool.map(m => m.latency.ttft_ms ?? 9999);
  const contextWindows  = pool.map(m => m.pricing.context_window);

  const minPrice   = Math.min(...blendedPrices);
  const maxPrice   = Math.max(...blendedPrices);
  const minCap     = Math.min(...capCounts);
  const maxCap     = Math.max(...capCounts);
  const minTtft    = Math.min(...ttfts);
  const maxTtft    = Math.max(...ttfts);
  const minContext = Math.min(...contextWindows);
  const maxContext = Math.max(...contextWindows);

  const weights = WEIGHTS[params.priority];

  // ── Score each model ──────────────────────────────────────────────────────
  const scored = pool.map((m, i) => {
    const costRaw  = 100 - normalize(blendedPrices[i], minPrice, maxPrice);   // lower price → higher score
    const capRaw   = normalize(capCounts[i], minCap, maxCap);
    const latRaw   = 100 - normalize(ttfts[i], minTtft, maxTtft);              // lower latency → higher score
    const ctxRaw   = normalize(contextWindows[i], minContext, maxContext);

    const total =
      costRaw  * weights.cost +
      capRaw   * weights.capability +
      latRaw   * weights.latency +
      ctxRaw   * weights.context;

    return {
      model:  m,
      score:  Math.round(total),
      scores: {
        cost:       Math.round(costRaw),
        capability: Math.round(capRaw),
        latency:    Math.round(latRaw),
        context:    Math.round(ctxRaw),
      },
    };
  });

  // ── Sort and take top 3 ───────────────────────────────────────────────────
  scored.sort((a, b) => b.score - a.score);
  const top3 = scored.slice(0, 3);

  return top3.map((item, i) => ({
    ...item,
    rank: (i + 1) as 1 | 2 | 3,
  }));
}
