import type {
  BillingInterval,
  PricingModel,
} from "@/shared/config/billing.config";

export function formatPriceAmount(
  unitAmount: number,
  options: { minimumFractionDigits?: number } = {},
) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
  }).format(unitAmount / 100);
}

export function getBillingIntervalSuffix(
  interval: BillingInterval,
  pricingModel: PricingModel,
  variant: "short" | "long" = "long",
) {
  if (pricingModel === "per_seat") {
    if (variant === "short") {
      return interval === "year" ? "per seat / yr" : "per seat / mo";
    }
    return interval === "year" ? "per seat / year" : "per seat / month";
  }

  if (variant === "short") {
    return interval === "year" ? "/ yr" : "/ mo";
  }
  return interval === "year" ? "/ year" : "/ month";
}
