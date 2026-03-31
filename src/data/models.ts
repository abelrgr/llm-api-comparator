import type { LLMModel, PricingStore } from "../types/index";

const OPENAI_SOURCE = "https://openai.com/api/pricing";
const ANTHROPIC_SOURCE = "https://www.anthropic.com/pricing";
const GOOGLE_SOURCE = "https://ai.google.dev/pricing";
const MISTRAL_SOURCE = "https://mistral.ai/technology";
const COHERE_SOURCE = "https://cohere.com/pricing";
const TOGETHER_SOURCE = "https://www.together.ai/pricing";

export const models: LLMModel[] = [
  // ─────────────────────────── OPENAI ────────────────────────────────────────
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    type: "chat",
    capabilities: ["vision", "function_calling", "streaming", "code"],
    pricing: {
      input_per_1m: 2.5,
      output_per_1m: 10.0,
      context_window: 128000,
      max_output: 4096,
    },
    latency: { ttft_ms: 520, tps: 82 },
    is_local: false,
    description:
      "OpenAI's flagship multimodal model combining GPT-4 intelligence with vision, audio, and image capabilities in a fast and affordable package.",
    release_date: "2024-05-13",
    source_url: OPENAI_SOURCE,
    subscription_tiers: [
      {
        name: "ChatGPT Plus",
        price_monthly: 20,
        requests_limit: undefined,
        features: [
          "Access to GPT-4o and GPT-4",
          "Advanced data analysis and web browsing",
          "Image generation with DALL-E 3",
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
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "openai",
    type: "chat",
    capabilities: ["function_calling", "streaming", "code"],
    pricing: {
      input_per_1m: 0.15,
      output_per_1m: 0.6,
      context_window: 128000,
      max_output: 16384,
    },
    latency: { ttft_ms: 290, tps: 125 },
    is_local: false,
    description:
      "Affordable and efficient small model that outperforms GPT-3.5 Turbo, designed for lightweight tasks with fast response times.",
    release_date: "2024-07-18",
    source_url: OPENAI_SOURCE,
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    type: "chat",
    capabilities: ["vision", "function_calling", "streaming", "code"],
    pricing: {
      input_per_1m: 10.0,
      output_per_1m: 30.0,
      context_window: 128000,
      max_output: 4096,
    },
    latency: { ttft_ms: 780, tps: 42 },
    is_local: false,
    description:
      "High-capability GPT-4 model with a 128k context window, optimized for complex tasks requiring deep reasoning and comprehensive understanding.",
    release_date: "2024-04-09",
    source_url: OPENAI_SOURCE,
  },
  {
    id: "o1-preview",
    name: "o1 Preview",
    provider: "openai",
    type: "chat",
    capabilities: ["reasoning", "code"],
    pricing: {
      input_per_1m: 15.0,
      output_per_1m: 60.0,
      context_window: 128000,
      max_output: 32768,
    },
    latency: { ttft_ms: 5200, tps: 24 },
    is_local: false,
    description:
      "OpenAI's advanced reasoning model that thinks before answering, excelling at complex math, science, and coding problems through extended internal deliberation.",
    release_date: "2024-09-12",
    source_url: OPENAI_SOURCE,
  },
  {
    id: "o1-mini",
    name: "o1 mini",
    provider: "openai",
    type: "chat",
    capabilities: ["reasoning", "code"],
    pricing: {
      input_per_1m: 3.0,
      output_per_1m: 12.0,
      context_window: 128000,
      max_output: 65536,
    },
    latency: { ttft_ms: 2900, tps: 38 },
    is_local: false,
    description:
      "Faster and more cost-efficient reasoning model optimized for STEM tasks, offering strong performance on coding and math at a fraction of o1 Preview's cost.",
    release_date: "2024-09-12",
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
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    type: "chat",
    capabilities: ["vision", "streaming", "code", "long_context"],
    pricing: {
      input_per_1m: 3.0,
      output_per_1m: 15.0,
      context_window: 200000,
      max_output: 8192,
    },
    latency: { ttft_ms: 610, tps: 72 },
    is_local: false,
    description:
      "Anthropic's most intelligent model yet, setting new industry benchmarks for graduate-level reasoning, code, and vision tasks with an industry-leading 200k context window.",
    release_date: "2024-10-22",
    source_url: ANTHROPIC_SOURCE,
    subscription_tiers: [
      {
        name: "Claude Pro",
        price_monthly: 20,
        features: [
          "5x more usage than Free plan",
          "Access to Claude 3.5 Sonnet and Claude 3 Opus",
          "Projects for organized workspaces",
          "Priority access during high traffic",
          "Early access to new Claude features",
          "Artifacts and advanced analysis tools",
        ],
        is_popular: true,
      },
      {
        name: "Claude Team",
        price_monthly: 30,
        features: [
          "Everything in Pro per member",
          "Higher usage limits than Pro",
          "Central billing and admin console",
          "Usage across your team",
          "Data not used for training by default",
        ],
        is_popular: false,
      },
    ],
  },
  {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
    type: "chat",
    capabilities: ["streaming", "code"],
    pricing: {
      input_per_1m: 0.8,
      output_per_1m: 4.0,
      context_window: 200000,
      max_output: 8192,
    },
    latency: { ttft_ms: 310, tps: 105 },
    is_local: false,
    description:
      "Anthropic's fastest and most compact model, offering best-in-class speed with exceptional coding skills and instruction following at a low cost.",
    release_date: "2024-11-05",
    source_url: ANTHROPIC_SOURCE,
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "anthropic",
    type: "chat",
    capabilities: ["vision", "reasoning", "long_context"],
    pricing: {
      input_per_1m: 15.0,
      output_per_1m: 75.0,
      context_window: 200000,
      max_output: 4096,
    },
    latency: { ttft_ms: 1180, tps: 28 },
    is_local: false,
    description:
      "Anthropic's most powerful model for highly complex tasks, offering top-level performance on a wide range of evaluations including nuanced content creation at the highest intelligence.",
    release_date: "2024-03-04",
    source_url: ANTHROPIC_SOURCE,
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    type: "chat",
    capabilities: ["vision", "streaming"],
    pricing: {
      input_per_1m: 0.25,
      output_per_1m: 1.25,
      context_window: 200000,
      max_output: 4096,
    },
    latency: { ttft_ms: 390, tps: 95 },
    is_local: false,
    description:
      "The fastest and most compact model in the Claude 3 family, near-instant responsiveness and strong performance at an accessible price point for high-throughput applications.",
    release_date: "2024-03-04",
    source_url: ANTHROPIC_SOURCE,
  },

  // ─────────────────────────── GOOGLE ────────────────────────────────────────
  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    type: "chat",
    capabilities: ["vision", "long_context", "code", "function_calling"],
    pricing: {
      input_per_1m: 3.5,
      output_per_1m: 10.5,
      context_window: 1000000,
      max_output: 8192,
    },
    latency: { ttft_ms: 720, tps: 63 },
    is_local: false,
    description:
      "Google's best-performing multimodal model with a breakthrough 1M token context window for processing long documents, videos, and code repositories in a single prompt.",
    release_date: "2024-05-23",
    source_url: GOOGLE_SOURCE,
  },
  {
    id: "gemini-1-5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    type: "chat",
    capabilities: ["vision", "long_context", "streaming"],
    pricing: {
      input_per_1m: 0.075,
      output_per_1m: 0.3,
      context_window: 1000000,
      max_output: 8192,
    },
    latency: { ttft_ms: 340, tps: 115 },
    is_local: false,
    description:
      "Google's fastest multimodal model optimized for high-volume tasks. Inherits Gemini 1.5 Pro's 1M context window at a fraction of the cost through model distillation.",
    release_date: "2024-05-23",
    source_url: GOOGLE_SOURCE,
  },
  {
    id: "gemini-1-0-pro",
    name: "Gemini 1.0 Pro",
    provider: "google",
    type: "chat",
    capabilities: ["function_calling", "streaming"],
    pricing: {
      input_per_1m: 0.5,
      output_per_1m: 1.5,
      context_window: 32760,
      max_output: 8192,
    },
    latency: { ttft_ms: 580, tps: 68 },
    is_local: false,
    description:
      "Google's first-generation production model optimized for natural language tasks, multi-turn conversations, and code generation with reliable performance.",
    release_date: "2023-12-13",
    source_url: GOOGLE_SOURCE,
    deprecated: false,
  },
  {
    id: "gemini-pro-vision",
    name: "Gemini Pro Vision",
    provider: "google",
    type: "multimodal",
    capabilities: ["vision", "streaming"],
    pricing: {
      input_per_1m: 0.5,
      output_per_1m: 1.5,
      context_window: 16384,
      max_output: 2048,
    },
    latency: { ttft_ms: 820, tps: 52 },
    is_local: false,
    description:
      "Google's multimodal model capable of understanding images and text simultaneously, enabling visual question answering, image captioning, and document analysis.",
    release_date: "2023-12-13",
    source_url: GOOGLE_SOURCE,
  },

  // ─────────────────────────── META ──────────────────────────────────────────
  {
    id: "llama-3-70b-api",
    name: "Llama 3 70B (API)",
    provider: "meta",
    type: "chat",
    capabilities: ["streaming", "code"],
    pricing: {
      input_per_1m: 0.9,
      output_per_1m: 0.9,
      context_window: 8192,
      max_output: 4096,
    },
    latency: { ttft_ms: 420, tps: 78 },
    is_local: false,
    description:
      "Meta's flagship open-source large language model available via hosted API (Together AI). Strong reasoning and instruction-following with competitive performance against proprietary models.",
    release_date: "2024-04-18",
    source_url: TOGETHER_SOURCE,
  },
  {
    id: "llama-3-8b-api",
    name: "Llama 3 8B (API)",
    provider: "meta",
    type: "chat",
    capabilities: ["streaming", "code"],
    pricing: {
      input_per_1m: 0.2,
      output_per_1m: 0.2,
      context_window: 8192,
      max_output: 4096,
    },
    latency: { ttft_ms: 190, tps: 160 },
    is_local: false,
    description:
      "Compact and efficient open-source model from Meta, available via hosted API. Ideal for lightweight tasks requiring fast inference at minimal cost.",
    release_date: "2024-04-18",
    source_url: TOGETHER_SOURCE,
  },
  {
    id: "llama-3-local",
    name: "Llama 3 (Self-hosted)",
    provider: "meta",
    type: "chat",
    capabilities: ["streaming", "code"],
    pricing: { input_per_1m: 0, output_per_1m: 0, context_window: 8192 },
    latency: { ttft_ms: null, tps: null },
    is_local: true,
    description:
      "Self-hosted via Ollama or similar runtime. Zero API costs — you only pay for your own hardware/cloud infrastructure.",
    release_date: "2024-04-18",
    source_url: "https://ollama.com/library/llama3",
  },

  // ─────────────────────────── MISTRAL ───────────────────────────────────────
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "mistral",
    type: "chat",
    capabilities: ["function_calling", "code", "streaming"],
    pricing: {
      input_per_1m: 8.0,
      output_per_1m: 24.0,
      context_window: 32768,
      max_output: 4096,
    },
    latency: { ttft_ms: 640, tps: 58 },
    is_local: false,
    description:
      "Mistral's flagship model with top-tier reasoning capabilities, native function calling, and deep code generation across 80+ programming languages.",
    release_date: "2024-02-26",
    source_url: MISTRAL_SOURCE,
  },
  {
    id: "mistral-small",
    name: "Mistral Small",
    provider: "mistral",
    type: "chat",
    capabilities: ["function_calling", "streaming"],
    pricing: {
      input_per_1m: 1.0,
      output_per_1m: 3.0,
      context_window: 32768,
      max_output: 4096,
    },
    latency: { ttft_ms: 350, tps: 98 },
    is_local: false,
    description:
      "Cost-efficient Mistral model for bulk operations with low latency. Ideal for classification, customer support, and text generation tasks at scale.",
    release_date: "2024-09-18",
    source_url: MISTRAL_SOURCE,
  },
  {
    id: "mistral-7b-instruct",
    name: "Mistral 7B Instruct",
    provider: "mistral",
    type: "chat",
    capabilities: ["streaming", "code"],
    pricing: {
      input_per_1m: 0.25,
      output_per_1m: 0.25,
      context_window: 32768,
      max_output: 4096,
    },
    latency: { ttft_ms: 270, tps: 128 },
    is_local: false,
    description:
      "Fine-tuned instruction-following version of Mistral 7B, offering outstanding performance for its size on coding, reasoning, and multi-turn dialogue tasks.",
    release_date: "2023-09-27",
    source_url: MISTRAL_SOURCE,
  },
  {
    id: "mistral-7b-local",
    name: "Mistral 7B (Self-hosted)",
    provider: "mistral",
    type: "chat",
    capabilities: ["streaming", "code"],
    pricing: { input_per_1m: 0, output_per_1m: 0, context_window: 32768 },
    latency: { ttft_ms: null, tps: null },
    is_local: true,
    description:
      "Self-hosted Mistral 7B via Ollama or llama.cpp. Efficient enough to run on consumer GPUs — zero API cost, complete data privacy.",
    release_date: "2023-09-27",
    source_url: "https://ollama.com/library/mistral",
  },

  // ─────────────────────────── COHERE ────────────────────────────────────────
  {
    id: "command-r-plus",
    name: "Command R+",
    provider: "cohere",
    type: "chat",
    capabilities: ["function_calling", "long_context", "streaming"],
    pricing: {
      input_per_1m: 3.0,
      output_per_1m: 15.0,
      context_window: 128000,
      max_output: 4000,
    },
    latency: { ttft_ms: 690, tps: 55 },
    is_local: false,
    description:
      "Cohere's most powerful model, optimized for enterprise RAG and tool use. State-of-the-art retrieval-augmented generation with multi-hop reasoning and grounded responses.",
    release_date: "2024-04-04",
    source_url: COHERE_SOURCE,
  },
  {
    id: "command-r",
    name: "Command R",
    provider: "cohere",
    type: "chat",
    capabilities: ["function_calling", "long_context", "streaming"],
    pricing: {
      input_per_1m: 0.5,
      output_per_1m: 1.5,
      context_window: 128000,
      max_output: 4000,
    },
    latency: { ttft_ms: 490, tps: 74 },
    is_local: false,
    description:
      "Cohere's balanced model for retrieval-augmented generation and complex reasoning tasks. Optimized for long context search and tool use at a lower price point.",
    release_date: "2024-03-11",
    source_url: COHERE_SOURCE,
  },
  {
    id: "command-light",
    name: "Command Light",
    provider: "cohere",
    type: "chat",
    capabilities: ["streaming"],
    pricing: {
      input_per_1m: 0.3,
      output_per_1m: 0.6,
      context_window: 4096,
      max_output: 4096,
    },
    latency: { ttft_ms: 240, tps: 135 },
    is_local: false,
    description:
      "Cohere's lightest chat model for high-throughput, low-latency applications. Fast response times make it ideal for chatbots and summarization pipelines.",
    release_date: "2023-11-29",
    source_url: COHERE_SOURCE,
  },
];

export function getInitialStore(): PricingStore {
  return {
    models,
    last_updated: new Date().toISOString(),
    version: 1,
  };
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
