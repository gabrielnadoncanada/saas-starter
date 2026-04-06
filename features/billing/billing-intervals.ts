import type { BillingInterval } from "@/shared/config/billing.config";

export function isBillingInterval(value: string): value is BillingInterval {
  return value === "month" || value === "year";
}
