import type { LLMModel, PricingStore } from "../types/index";

const OPENAI_SOURCE = "https://developers.openai.com/api/docs/pricing";
const ANTHROPIC_SOURCE = "https://platform.claude.com/docs/en/docs/about-claude/models/overview";
const GOOGLE_SOURCE = "https://ai.google.dev/pricing";
const MISTRAL_SOURCE = "https://docs.mistral.ai/models/";
const COHERE_SOURCE = "https://docs.cohere.com/v2/docs/command-a";
const TOGETHER_SOURCE = "https://www.together.ai/pricing";
const XAI_SOURCE = "https://docs.x.ai/developers/models";

export const models: LLMModel[] = [
  // ─────────────────────────── OPENAI ────────────────────────────────────────
  {
    id: "gpt-5-4",
    name: "GPT-5.4",
    provider: "openai",
    type: "chat",
    capabilities: ["vision", "function_calling", "streaming", "code", "reasoning", "long_context"],
    pricing: {
      input_per_1m: 2.5,
      output_per_1m: 15.0,
      context_window: 1000000,
      max_output: 131072,
    },
    latency: { ttft_ms: 550, tps: 78 },
    is_local: false,
    description:
      "OpenAI's flagship model for complex reasoning, coding, and professional workflows. Features a 1M token context window, advanced vision capabilities, and multi-step agentic task execution.",
    release_date: "2026-03-01",
    source_url: OPENAI_SOURCE,
    subscription_tiers: [
      {
        name: "ChatGPT Plus",
        price_monthly: 20,
        features: [
          "Access to GPT-5.4 and GPT-5.4 mini",
          "Advanced data analysis and web browsing",
          "Image generation with GPT Image",
          "Custom GPTs access",
          "Higher message limits vs free tier",
          "Early access to new features",
        ],
        is_popular: true,
      },
      {
        name: "ChatGPT Team",
        price_monthly: 30,
        features: [
          "Everything in Plus",
          "Higher message caps for all models",
          "Workspace for teams (admin console)",
          "Data not used for training",
          "Priority support",
        ],
        is_popular: false,
      },
    ],
  },
  {
    id: "gpt-5-4-mini",
    name: "GPT-5.4 mini",
    provider: "openai",
    type: "chat",
    capabilities: ["vision", "function_calling", "streaming", "code"],
    pricing: {
      input_per_1m: 0.75,
      output_per_1m: 4.5,
      context_window: 400000,
      max_output: 131072,
    },
    latency: { ttft_ms: 250, tps: 130 },
    is_local: false,
    description:
      "OpenAI's strongest mini model for coding, computer use, and subagents. Delivers GPT-5.4-class intelligence at a fraction of the cost, ideal for high-volume production workloads.",
    release_date: "2026-03-01",
    source_url: OPENAI_SOURCE,
  },
  {
    id: "gpt-5-4-nano",
    name: "GPT-5.4 nano",
    provider: "openai",
    type: "chat",
    capabilities: ["function_calling", "streaming", "code"],
    pricing: {
      input_per_1m: 0.2,
      output_per_1m: 1.25,
      context_window: 400000,
      max_output: 131072,
    },
    latency: { ttft_ms: 140, tps: 200 },
    is_local: false,
    description:
      "OpenAI's cheapest GPT-5.4-class model designed for simple, high-volume tasks. Ultra-low latency and cost make it ideal for classification, routing, and lightweight summarization at scale.",
    release_date: "2026-03-01",
    source_url: OPENAI_SOURCE,
  },
  {
    id: "text-embedding-3-small",
    name: "text-embedding-3-small",
    provider: "openai",
    type: "embedding",
    capabilities: [],
    pricing: { input_per_1m: 0.02, output_per_1m: 0, context_window: 8191 },
    latency: { ttft_ms: 45, tps: null },
    is_local: false,
    description:
      "Highly efficient embedding model with strong multilingual performance, significantly outperforming the second generation ada embedding model.",
    release_date: "2024-01-25",
    source_url: OPENAI_SOURCE,
  },
  {
    id: "text-embedding-3-large",
    name: "text-embedding-3-large",
    provider: "openai",
    type: "embedding",
    capabilities: [],
    pricing: { input_per_1m: 0.13, output_per_1m: 0, context_window: 8191 },
    latency: { ttft_ms: 75, tps: null },
    is_local: false,
    description:
      "Most capable embedding model for English and multi-lingual tasks, producing larger vector representations for higher retrieval accuracy.",
    release_date: "2024-01-25",
    source_url: OPENAI_SOURCE,
  },

  // ─────────────────────────── ANTHROPIC ─────────────────────────────────────
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    provider: "anthropic",
    type: "chat",
    capabilities: ["vision", "reasoning", "code", "long_context", "streaming", "function_calling"],
    pricing: {
      input_per_1m: 5.0,
      output_per_1m: 25.0,
      context_window: 1000000,
      max_output: 131072,
    },
    latency: { ttft_ms: 920, tps: 48 },
    is_local: false,
    description:
      "Anthropic's most intelligent model, built for agent-based workflows and complex coding tasks. Features extended thinking, a 1M token context, and up to 128K output tokens for deep, long-form reasoning.",
    release_date: "2025-09-01",
    source_url: ANTHROPIC_SOURCE,
    subscription_tiers: [
      {
        name: "Claude Max",
        price_monthly: 100,
        features: [
          "Access to Claude Opus 4.6 and all models",
          "5x or 20x more usage than Pro",
          "Higher output limits for all tasks",
          "Early access to advanced Claude features",
          "Priority access at high traffic times",
        ],
        is_popular: false,
      },
      {
        name: "Claude Team",
        price_monthly: 30,
        features: [
          "Everything in Pro per member",
          "Higher usage limits than Pro per member",
          "Central billing and admin console",
          "Data not used for training by default",
        ],
        is_popular: false,
      },
    ],
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    type: "chat",
    capabilities: ["vision", "reasoning", "code", "long_context", "streaming", "function_calling"],
    pricing: {
      input_per_1m: 3.0,
      output_per_1m: 15.0,
      context_window: 1000000,
      max_output: 65536,
    },
    latency: { ttft_ms: 560, tps: 82 },
    is_local: false,
    description:
      "Anthropic's best combination of intelligence and speed. Excels at coding, analysis, and complex reasoning while remaining cost-efficient for production deployments with a 1M token context.",
    release_date: "2025-10-01",
    source_url: ANTHROPIC_SOURCE,
    subscription_tiers: [
      {
        name: "Claude Pro",
        price_monthly: 20,
        features: [
          "Access to Claude Sonnet 4.6 and other models",
          "More usage than Free plan",
          "Includes Claude Code and Cowork",
          "Access to unlimited projects",
          "Research and memory features",
          "Priority access during high traffic",
        ],
        is_popular: true,
      },
    ],
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    type: "chat",
    capabilities: ["vision", "streaming", "code", "function_calling"],
    pricing: {
      input_per_1m: 1.0,
      output_per_1m: 5.0,
      context_window: 200000,
      max_output: 65536,
    },
    latency: { ttft_ms: 200, tps: 145 },
    is_local: false,
    description:
      "Anthropic's fastest model with near-frontier intelligence, optimized for high-throughput, low-latency applications. Supports vision and extended thinking for responsive AI pipelines.",
    release_date: "2025-10-01",
    source_url: ANTHROPIC_SOURCE,
  },

  // ─────────────────────────── GOOGLE ────────────────────────────────────────
  {
    id: "gemini-3-1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    provider: "google",
    type: "chat",
    capabilities: ["vision", "long_context", "code", "function_calling", "streaming", "reasoning"],
    pricing: {
      input_per_1m: 1.0,
      output_per_1m: 6.0,
      context_window: 1000000,
      max_output: 8192,
    },
    latency: { ttft_ms: 800, tps: 60 },
    is_local: false,
    description:
      "Google's latest generation of intelligence, usability, and multimodal understanding. Gemini 3.1 Pro excels at coding, complex reasoning, and agentic task flows with custom tools support.",
    release_date: "2026-02-01",
    source_url: GOOGLE_SOURCE,
  },
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview",
    provider: "google",
    type: "chat",
    capabilities: ["vision", "long_context", "streaming", "function_calling"],
    pricing: {
      input_per_1m: 0.25,
      output_per_1m: 1.5,
      context_window: 1000000,
      max_output: 8192,
    },
    latency: { ttft_ms: 380, tps: 110 },
    is_local: false,
    description:
      "Google's most intelligent model built for speed, combining frontier intelligence with superior search and grounding. Ideal for real-time applications requiring high accuracy at scale.",
    release_date: "2026-01-01",
    source_url: GOOGLE_SOURCE,
  },
  {
    id: "gemini-2-5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    type: "chat",
    capabilities: ["vision", "long_context", "code", "function_calling", "streaming", "reasoning"],
    pricing: {
      input_per_1m: 0.625,
      output_per_1m: 5.0,
      context_window: 1000000,
      max_output: 8192,
    },
    latency: { ttft_ms: 700, tps: 65 },
    is_local: false,
    description:
      "Google's state-of-the-art multipurpose model excelling at coding and complex reasoning. Features a 1M token context window, native thinking capabilities, and strong performance on benchmarks.",
    release_date: "2025-05-01",
    source_url: GOOGLE_SOURCE,
  },
  {
    id: "gemini-2-5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    type: "chat",
    capabilities: ["vision", "long_context", "streaming", "function_calling", "reasoning"],
    pricing: {
      input_per_1m: 0.15,
      output_per_1m: 1.25,
      context_window: 1000000,
      max_output: 8192,
    },
    latency: { ttft_ms: 350, tps: 115 },
    is_local: false,
    description:
      "Google's first hybrid reasoning model with a 1M token context window and configurable thinking budgets. Strikes the ideal balance of speed, cost, and intelligence for production deployments.",
    release_date: "2025-04-01",
    source_url: GOOGLE_SOURCE,
  },
  {
    id: "gemini-2-5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    provider: "google",
    type: "chat",
    capabilities: ["streaming", "function_calling"],
    pricing: {
      input_per_1m: 0.05,
      output_per_1m: 0.2,
      context_window: 1000000,
      max_output: 8192,
    },
    latency: { ttft_ms: 190, tps: 165 },
    is_local: false,
    description:
      "Google's smallest and most cost-effective model, built for at-scale usage. Ideal for lightweight classification, summarization, and high-throughput pipelines where cost is critical.",
    release_date: "2025-06-01",
    source_url: GOOGLE_SOURCE,
  },
  {
    id: "gemini-embedding",
    name: "Gemini Embedding",
    provider: "google",
    type: "embedding",
    capabilities: [],
    pricing: { input_per_1m: 0.075, output_per_1m: 0, context_window: 8192 },
    latency: { ttft_ms: 60, tps: null },
    is_local: false,
    description:
      "Google's Gemini Embeddings model for text-only use cases. Provides high-quality semantic representations for retrieval, clustering, and semantic search applications.",
    release_date: "2025-03-01",
    source_url: GOOGLE_SOURCE,
  },
  {
    id: "gemini-2-0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    type: "chat",
    capabilities: ["vision", "long_context", "streaming", "function_calling"],
    pricing: { input_per_1m: 0.05, output_per_1m: 0.2, context_window: 1000000, max_output: 8192 },
    latency: { ttft_ms: 300, tps: 130 },
    is_local: false,
    description:
      "Google's workhorse multimodal model with fast response times and strong performance across text, image, and code tasks at a very low cost per token.",
    release_date: "2025-02-01",
    source_url: GOOGLE_SOURCE,
  },
  {
    id: "gemini-2-0-flash-lite",
    name: "Gemini 2.0 Flash-Lite",
    provider: "google",
    type: "chat",
    capabilities: ["streaming", "function_calling"],
    pricing: { input_per_1m: 0.0375, output_per_1m: 0.15, context_window: 1000000, max_output: 8192 },
    latency: { ttft_ms: 220, tps: 175 },
    is_local: false,
    description:
      "Google's most cost-efficient model for simple tasks. Optimized for classification, routing, and lightweight summarization at extremely low cost.",
    release_date: "2025-02-01",
    source_url: GOOGLE_SOURCE,
  },

  // ─────────────────────────── META ──────────────────────────────────────────
  {
    id: "llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: "meta",
    type: "chat",
    capabilities: ["vision", "streaming", "code", "function_calling", "long_context"],
    pricing: {
      input_per_1m: 0.27,
      output_per_1m: 0.85,
      context_window: 1048576,
      max_output: 8192,
    },
    latency: { ttft_ms: 350, tps: 88 },
    is_local: false,
    description:
      "Meta's flagship open-source multimodal model (401.6B params, 17B active via 128-expert MoE). Supports 12 languages, 1M token context, and vision — at an 80%+ cost reduction vs. closed-source alternatives.",
    release_date: "2025-04-05",
    source_url: "https://www.together.ai/models/llama-4-maverick",
  },
  {
    id: "llama-3-3-70b",
    name: "Llama 3.3 70B (API)",
    provider: "meta",
    type: "chat",
    capabilities: ["streaming", "code", "function_calling"],
    pricing: {
      input_per_1m: 0.88,
      output_per_1m: 0.88,
      context_window: 131072,
      max_output: 8192,
    },
    latency: { ttft_ms: 400, tps: 72 },
    is_local: false,
    description:
      "Meta's latest 70B open-source model available via hosted API (Together AI). Strong all-around performance for reasoning, instruction-following, and coding tasks with a 128K context window.",
    release_date: "2024-12-06",
    source_url: TOGETHER_SOURCE,
  },
  {
    id: "llama-4-local",
    name: "Llama 4 Scout (Self-hosted)",
    provider: "meta",
    type: "chat",
    capabilities: ["vision", "streaming", "code"],
    pricing: { input_per_1m: 0, output_per_1m: 0, context_window: 1000000 },
    latency: { ttft_ms: null, tps: null },
    is_local: true,
    description:
      "Self-hosted Llama 4 Scout via Ollama or equivalent runtime. 109B parameters (17B active) with 1M context window. Zero API costs — you only pay for your own hardware.",
    release_date: "2025-04-05",
    source_url: "https://ollama.com/library/llama4",
  },

  // ─────────────────────────── MISTRAL ───────────────────────────────────────
  {
    id: "mistral-large-3",
    name: "Mistral Large 3",
    provider: "mistral",
    type: "chat",
    capabilities: ["vision", "function_calling", "code", "streaming"],
    pricing: {
      input_per_1m: 0.5,
      output_per_1m: 1.5,
      context_window: 256000,
      max_output: 4096,
    },
    latency: { ttft_ms: 550, tps: 62 },
    is_local: false,
    description:
      "Mistral's state-of-the-art open-weight multimodal model with 675B total parameters and 41B active via a granular MoE architecture. Best-in-class open-source performance for complex, agentic tasks.",
    release_date: "2025-12-02",
    source_url: MISTRAL_SOURCE,
  },
  {
    id: "mistral-medium-3-1",
    name: "Mistral Medium 3.1",
    provider: "mistral",
    type: "chat",
    capabilities: ["vision", "function_calling", "code", "streaming"],
    pricing: {
      input_per_1m: 0.4,
      output_per_1m: 2.0,
      context_window: 256000,
      max_output: 4096,
    },
    latency: { ttft_ms: 410, tps: 85 },
    is_local: false,
    description:
      "Mistral's frontier-class multimodal model offering state-of-the-art performance at a compelling price point. Excellent for enterprise tasks requiring vision, code, and precise instruction-following.",
    release_date: "2025-08-01",
    source_url: MISTRAL_SOURCE,
  },
  {
    id: "mistral-small-4",
    name: "Mistral Small 4",
    provider: "mistral",
    type: "chat",
    capabilities: ["function_calling", "code", "streaming", "reasoning"],
    pricing: {
      input_per_1m: 0.15,
      output_per_1m: 0.6,
      context_window: 256000,
      max_output: 4096,
    },
    latency: { ttft_ms: 200, tps: 155 },
    is_local: false,
    description:
      "Mistral's latest hybrid open-weight model (119B total, 6.5B active) unifying instruct, reasoning, and coding in a single efficient model. Released March 2026 with best-in-class small model performance.",
    release_date: "2026-03-16",
    source_url: MISTRAL_SOURCE,
  },
  {
    id: "mistral-small-4-local",
    name: "Mistral Small 4 (Self-hosted)",
    provider: "mistral",
    type: "chat",
    capabilities: ["function_calling", "streaming", "code", "reasoning"],
    pricing: { input_per_1m: 0, output_per_1m: 0, context_window: 256000 },
    latency: { ttft_ms: null, tps: null },
    is_local: true,
    description:
      "Self-hosted Mistral Small 4 via Ollama or llama.cpp. Open-weight model with 6.5B active parameters — runs efficiently on consumer GPUs with zero API cost and full data privacy.",
    release_date: "2026-03-16",
    source_url: "https://ollama.com/library/mistral-small",
  },

  // ─────────────────────────── COHERE ────────────────────────────────────────
  {
    id: "command-a",
    name: "Command A",
    provider: "cohere",
    type: "chat",
    capabilities: ["function_calling", "long_context", "streaming"],
    pricing: {
      input_per_1m: 2.5,
      output_per_1m: 10.0,
      context_window: 256000,
      max_output: 8000,
    },
    latency: { ttft_ms: 620, tps: 60 },
    is_local: false,
    description:
      "Cohere's most performant model (111B params), excelling at enterprise tool use, RAG, and multilingual agents. Requires only 2 GPUs to run with 150% higher throughput vs. its predecessor.",
    release_date: "2025-03-01",
    source_url: COHERE_SOURCE,
  },
  {
    id: "command-r",
    name: "Command R",
    provider: "cohere",
    type: "chat",
    capabilities: ["function_calling", "long_context", "streaming"],
    pricing: {
      input_per_1m: 0.15,
      output_per_1m: 0.6,
      context_window: 128000,
      max_output: 4000,
    },
    latency: { ttft_ms: 450, tps: 80 },
    is_local: false,
    description:
      "Cohere's scalable conversational model optimized for RAG and multi-turn dialogue. High precision grounding with citations, tool use, and strong multilingual support across 10 languages.",
    release_date: "2024-08-01",
    source_url: "https://docs.cohere.com/v2/docs/command-r",
  },

  // ─────────────────────────── xAI / GROK ────────────────────────────────────
  {
    id: "grok-4-20",
    name: "Grok 4.20",
    provider: "xai",
    type: "chat",
    capabilities: ["vision", "reasoning", "function_calling", "streaming", "long_context"],
    pricing: {
      input_per_1m: 2.0,
      output_per_1m: 6.0,
      context_window: 2000000,
      max_output: 131072,
    },
    latency: { ttft_ms: 600, tps: 70 },
    is_local: false,
    description:
      "xAI's flagship reasoning model with industry-leading speed and agentic tool-calling. Combines the lowest hallucination rate on the market with strict prompt adherence and a 2M token context window.",
    release_date: "2026-03-09",
    source_url: XAI_SOURCE,
  },
  {
    id: "grok-4-1-fast",
    name: "Grok 4.1 Fast",
    provider: "xai",
    type: "chat",
    capabilities: ["vision", "reasoning", "function_calling", "streaming", "long_context"],
    pricing: {
      input_per_1m: 0.2,
      output_per_1m: 0.5,
      context_window: 2000000,
      max_output: 131072,
    },
    latency: { ttft_ms: 280, tps: 140 },
    is_local: false,
    description:
      "xAI's cost-efficient lightweight model excelling at tool-calling. Delivers Grok 4-class capabilities at 90%+ cost reduction with near-instant responses and a 2M token context window.",
    release_date: "2026-02-01",
    source_url: XAI_SOURCE,
  },
];

export function getInitialStore(): PricingStore {
  return { models: [], last_updated: '', version: 0 };
}

// Derived helpers
export function getBestValueModel(ms: LLMModel[]): LLMModel | null {
  const paid = ms.filter((m) => !m.is_local && m.pricing.output_per_1m > 0);
  if (!paid.length) return null;
  return paid.reduce((best, m) =>
    m.pricing.output_per_1m < best.pricing.output_per_1m ? m : best,
  );
}

export function getMostCapableModel(ms: LLMModel[]): LLMModel | null {
  if (!ms.length) return null;
  return ms.reduce((best, m) =>
    m.capabilities.length > best.capabilities.length ? m : best,
  );
}
