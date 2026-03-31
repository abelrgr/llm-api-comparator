import type { LLMModel } from "../types/index";

export interface UsageParams {
  messages_per_day: number;
  avg_input_tokens: number;
  avg_output_tokens: number;
  days_per_month: number;
}

export interface CostBreakdown {
  model_id: string;
  daily_input_tokens: number;
  daily_output_tokens: number;
  monthly_input_tokens: number;
  monthly_output_tokens: number;
  cost_per_request: number;
  cost_per_1m_blended: number;
  monthly_cost: number;
  annual_cost: number;
  subscription_monthly?: number;
  subscription_break_even_msgs?: number;
  subscription_name?: string;
  is_free: boolean;
}

export function calculateCost(
  model: LLMModel,
  usage: UsageParams,
): CostBreakdown {
  const {
    messages_per_day,
    avg_input_tokens,
    avg_output_tokens,
    days_per_month,
  } = usage;

  const daily_input_tokens = messages_per_day * avg_input_tokens;
  const daily_output_tokens = messages_per_day * avg_output_tokens;
  const monthly_input_tokens = daily_input_tokens * days_per_month;
  const monthly_output_tokens = daily_output_tokens * days_per_month;

  if (model.is_local) {
    return {
      model_id: model.id,
      daily_input_tokens,
      daily_output_tokens,
      monthly_input_tokens,
      monthly_output_tokens,
      cost_per_request: 0,
      cost_per_1m_blended: 0,
      monthly_cost: 0,
      annual_cost: 0,
      is_free: true,
    };
  }

  const input_cost_per_token = model.pricing.input_per_1m / 1_000_000;
  const output_cost_per_token = model.pricing.output_per_1m / 1_000_000;

  const cost_per_request =
    avg_input_tokens * input_cost_per_token +
    avg_output_tokens * output_cost_per_token;

  const total_tokens = avg_input_tokens + avg_output_tokens;
  const cost_per_1m_blended =
    total_tokens > 0
      ? (avg_input_tokens * model.pricing.input_per_1m +
          avg_output_tokens * model.pricing.output_per_1m) /
        total_tokens
      : 0;

  const monthly_cost =
    (monthly_input_tokens / 1_000_000) * model.pricing.input_per_1m +
    (monthly_output_tokens / 1_000_000) * model.pricing.output_per_1m;

  const annual_cost = monthly_cost * 12;

  let subscription_monthly: number | undefined;
  let subscription_break_even_msgs: number | undefined;
  let subscription_name: string | undefined;

  if (model.subscription_tiers && model.subscription_tiers.length > 0) {
    const cheapest = model.subscription_tiers.reduce((min, tier) =>
      tier.price_monthly < min.price_monthly ? tier : min,
    );
    subscription_monthly = cheapest.price_monthly;
    subscription_name = cheapest.name;

    if (cost_per_request > 0) {
      // msgs/day where sub_monthly == msgs * days * cost_per_request
      subscription_break_even_msgs =
        subscription_monthly / (days_per_month * cost_per_request);
    }
  }

  return {
    model_id: model.id,
    daily_input_tokens,
    daily_output_tokens,
    monthly_input_tokens,
    monthly_output_tokens,
    cost_per_request,
    cost_per_1m_blended,
    monthly_cost,
    annual_cost,
    subscription_monthly,
    subscription_break_even_msgs,
    subscription_name,
    is_free: false,
  };
}

export function rankModels(breakdowns: CostBreakdown[]): CostBreakdown[] {
  return [...breakdowns].sort((a, b) => a.monthly_cost - b.monthly_cost);
}

export function formatCostDisplay(usd: number): string {
  if (usd === 0) return "FREE";
  if (usd < 0.001) return `$${usd.toFixed(5)}`;
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  if (usd >= 10_000) return `~$${(usd / 1000).toFixed(0)}K`;
  if (usd >= 1_000) return `~$${(usd / 1000).toFixed(1)}K`;
  return `$${usd.toFixed(2)}`;
}

export function getDefaultUsageProfiles(): {
  name: string;
  key: string;
  params: UsageParams;
}[] {
  return [
    {
      name: "Light",
      key: "calculator.preset_light",
      params: {
        messages_per_day: 10,
        avg_input_tokens: 100,
        avg_output_tokens: 200,
        days_per_month: 30,
      },
    },
    {
      name: "Medium",
      key: "calculator.preset_medium",
      params: {
        messages_per_day: 50,
        avg_input_tokens: 300,
        avg_output_tokens: 500,
        days_per_month: 30,
      },
    },
    {
      name: "Heavy",
      key: "calculator.preset_heavy",
      params: {
        messages_per_day: 200,
        avg_input_tokens: 500,
        avg_output_tokens: 1000,
        days_per_month: 30,
      },
    },
  ];
}
