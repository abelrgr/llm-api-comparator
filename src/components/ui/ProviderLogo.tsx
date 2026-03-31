import { PROVIDER_COLORS, PROVIDER_LABELS, type Provider } from "../../types";
import { cn } from "../../lib/utils";

const SYMBOLS: Record<Provider, string> = {
  openai: "⟨⟩",
  anthropic: "∿",
  google: "G",
  meta: "M",
  mistral: "≋",
  cohere: "Co",
  local: "⚙",
};

interface ProviderLogoProps {
  provider: Provider;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<ProviderLogoProps["size"]>, string> = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

export default function ProviderLogo({
  provider,
  size = "md",
  className,
}: ProviderLogoProps) {
  const color = PROVIDER_COLORS[provider];
  const symbol = SYMBOLS[provider];
  const label = PROVIDER_LABELS[provider];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold select-none shrink-0",
        SIZE_CLASSES[size],
        className,
      )}
      style={{
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
      title={label}
      aria-label={label}
    >
      {symbol}
    </span>
  );
}
