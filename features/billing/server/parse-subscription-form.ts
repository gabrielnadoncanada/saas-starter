import {
  getPlanDisplayPrice,
  isPlanId,
} from "@/features/billing/catalog";
import { isBillingInterval } from "@/features/billing/billing-intervals";
import type { BillingInterval, PlanId } from "@/shared/config/billing.config";

export type SubscriptionFormSelection = {
  planId: PlanId;
  billingInterval: BillingInterval;
  seatQuantity: number | null;
};

export function parseSubscriptionForm(
  formData: FormData,
): SubscriptionFormSelection {
  const rawPlanId = formData.get("planId");
  const rawBillingInterval = formData.get("billingInterval");
  const rawSeatQuantity = formData.get("seatQuantity");

  const planId = typeof rawPlanId === "string" ? rawPlanId : null;
  const billingInterval =
    typeof rawBillingInterval === "string" ? rawBillingInterval : null;
  const seatQuantity =
    typeof rawSeatQuantity === "string" ? Number(rawSeatQuantity) : NaN;

  if (
    !planId ||
    !isPlanId(planId) ||
    planId === "free" ||
    !billingInterval ||
    !isBillingInterval(billingInterval) ||
    !getPlanDisplayPrice(planId, billingInterval)
  ) {
    throw new Error("Invalid billing selection.");
  }

  return {
    planId,
    billingInterval,
    seatQuantity: Number.isFinite(seatQuantity)
      ? Math.max(1, seatQuantity)
      : null,
  };
}
