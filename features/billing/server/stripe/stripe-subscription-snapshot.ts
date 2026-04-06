import { getPlan, isPlanId } from "@/features/billing/catalog";
import type {
  BillingInterval,
  PricingModel,
} from "@/shared/config/billing.config";
import { db } from "@/shared/lib/db/prisma";

export type SubscriptionSnapshot = {
  cancelAt: Date | null;
  cancelAtPeriodEnd: boolean;
  periodEnd: Date | null;
  seats: number | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: string | null;
  billingInterval: BillingInterval | null;
  subscriptionStatus: string | null;
  pricingModel: PricingModel | null;
};

const emptySnapshot: SubscriptionSnapshot = {
  billingInterval: null,
  cancelAt: null,
  cancelAtPeriodEnd: false,
  plan: null,
  periodEnd: null,
  pricingModel: null,
  seats: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: null,
};

export async function getOrganizationSubscriptionSnapshot(
  organizationId: string,
): Promise<SubscriptionSnapshot> {
  const sub = await db.subscription.findFirst({
    where: { referenceId: organizationId },
    orderBy: [{ updatedAt: "desc" }],
  });

  if (!sub) {
    return emptySnapshot;
  }

  return {
    cancelAt: sub.cancelAt ?? null,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
    periodEnd: sub.periodEnd ?? null,
    seats: sub.seats ?? null,
    stripeCustomerId: sub.stripeCustomerId ?? null,
    stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
    plan: sub.plan,
    billingInterval:
      sub.billingInterval === "month" || sub.billingInterval === "year"
        ? sub.billingInterval
        : null,
    subscriptionStatus: sub.status ?? null,
    pricingModel:
      sub.plan && isPlanId(sub.plan) ? getPlan(sub.plan).pricingModel : null,
  };
}
