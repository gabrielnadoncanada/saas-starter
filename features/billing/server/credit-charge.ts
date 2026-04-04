import type { LanguageModelUsage } from "ai";

import type { CreditChargeStrategy } from "@/shared/config/billing.config";

export function getCreditReserve(strategy: CreditChargeStrategy) {
  if (strategy.type === "flat_per_action") {
    return strategy.reserveCredits ?? strategy.credits;
  }

  return strategy.reserveCredits;
}

export function calculateCreditCharge(params: {
  strategy: CreditChargeStrategy;
  modelId: string;
  usage?: LanguageModelUsage | null;
}) {
  if (params.strategy.type === "flat_per_action") {
    return params.strategy.credits;
  }

  const modelPricing = params.strategy.modelPricing[params.modelId];

  if (!modelPricing || !params.usage) {
    return params.strategy.reserveCredits;
  }

  const inputTokens = params.usage.inputTokens ?? 0;
  const outputTokens = params.usage.outputTokens ?? 0;
  const inputCostUsd =
    (inputTokens / 1_000_000) * modelPricing.inputUsdPerMillion;
  const outputCostUsd =
    (outputTokens / 1_000_000) * modelPricing.outputUsdPerMillion;
  const totalCostUsd = (inputCostUsd + outputCostUsd) * params.strategy.markupMultiplier;

  return Math.max(
    1,
    Math.ceil(totalCostUsd / Math.max(params.strategy.usdPerCredit, 0.000001)),
  );
}
