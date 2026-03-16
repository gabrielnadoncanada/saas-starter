export type PricingModel = "flat" | "per_seat" | "one_time";

const VALID_MODELS: Set<string> = new Set(["flat", "per_seat", "one_time"]);

export function resolvePricingModel(
  metadata: Record<string, string> | null | undefined,
): PricingModel {
  const value = metadata?.pricing_model;
  if (value && VALID_MODELS.has(value)) return value as PricingModel;
  return "flat";
}
