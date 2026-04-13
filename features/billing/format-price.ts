import type { BillingInterval } from "@/shared/config/billing.config";

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
  variant: "short" | "long" = "long",
) {
  if (variant === "short") {
    return interval === "year" ? "/ yr" : "/ mo";
  }
  return interval === "year" ? "/ year" : "/ month";
}
