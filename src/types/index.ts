export type Provider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'meta'
  | 'mistral'
  | 'cohere'
  | 'xai'
  | 'local';

export type ModelType = 'chat' | 'completion' | 'embedding' | 'image' | 'multimodal';

export type ModelCapability =
  | 'vision'
  | 'function_calling'
  | 'streaming'
  | 'fine_tuning'
  | 'long_context'
  | 'code'
  | 'reasoning';

export interface TokenPricing {
  input_per_1m: number;
  output_per_1m: number;
  context_window: number;
  max_output?: number;
}

export interface LatencyInfo {
  /** Median time-to-first-token in milliseconds (null = N/A / varies by hardware) */
  ttft_ms: number | null;
  /** Median output throughput in tokens per second (null = N/A) */
  tps: number | null;
}

export interface SubscriptionTier {
  name: string;
  price_monthly: number;
  included_tokens?: number;
  requests_limit?: number;
  features: string[];
  is_popular?: boolean;
}

export interface LLMModel {
  id: string;
  name: string;
  provider: Provider;
  type: ModelType;
  capabilities: ModelCapability[];
  pricing: TokenPricing;
  latency: LatencyInfo;
  subscription_tiers?: SubscriptionTier[];
  snippet_js?: string;       // JS (fetch) example from backend, undefined = use local fallback
  is_local: boolean;
  description: string;
  release_date: string;
  deprecated?: boolean;
  source_url: string;
}

export interface PricingStore {
  models: LLMModel[];
  last_updated: string;
  version: number;
}

export interface FilterState {
  providers: Provider[];
  types: ModelType[];
  capabilities: ModelCapability[];
  search: string;
  show_local: boolean;
  max_price_per_1m: number | null;
}

export interface SelectedModel {
  model_id: string;
  is_pinned: boolean;
}

// Provider hex colors (matches Design System Reference)
export const PROVIDER_COLORS: Record<Provider, string> = {
  openai:    '#74aa9c',
  anthropic: '#d97757',
  google:    '#4285f4',
  meta:      '#0668e1',
  mistral:   '#ff7000',
  cohere:    '#39594d',
  xai:       '#1d9bf0',
  local:     '#6b7280',
};

export const PROVIDER_LABELS: Record<Provider, string> = {
  openai:    'OpenAI',
  anthropic: 'Anthropic',
  google:    'Google',
  meta:      'Meta',
  mistral:   'Mistral',
  cohere:    'Cohere',
  xai:       'xAI',
  local:     'Local',
};

export const ALL_PROVIDERS: Provider[] = [
  'openai', 'anthropic', 'google', 'meta', 'mistral', 'cohere', 'xai', 'local',
];

export const ALL_TYPES: ModelType[] = [
  'chat', 'completion', 'embedding', 'image', 'multimodal',
];

export const ALL_CAPABILITIES: ModelCapability[] = [
  'vision', 'function_calling', 'streaming', 'fine_tuning',
  'long_context', 'code', 'reasoning',
];

export const DEFAULT_FILTERS: FilterState = {
  providers: [],
  types: [],
  capabilities: [],
  search: '',
  show_local: true,
  max_price_per_1m: null,
};
