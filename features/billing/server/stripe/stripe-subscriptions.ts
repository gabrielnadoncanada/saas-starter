import { getPlan, isPlanId } from "@/features/billing/catalog/resolver";
import {
  type BillingInterval,
  type PricingModel,
} from "@/shared/config/billing.config";
import { db } from "@/shared/lib/db/prisma";

type SubscriptionSnapshot = {
  billingInterval: BillingInterval | null;
  cancelAt: Date | null;
  cancelAtPeriodEnd: boolean;
  planId: string | null;
  periodEnd: Date | null;
  pricingModel: PricingModel | null;
  seats: number | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
};

function toPricingModel(planId: string | null): PricingModel | null {
  if (!planId || !isPlanId(planId)) {
    return null;
  }

  return getPlan(planId).pricingModel;
}

export async function getOrganizationSubscriptionSnapshot(
  organizationId: string,
): Promise<SubscriptionSnapshot> {
  const subscription = await db.subscription.findFirst({
    where: { referenceId: organizationId },
    orderBy: [{ updatedAt: "desc" }],
  });

  if (!subscription) {
    return {
      billingInterval: null,
      cancelAt: null,
      cancelAtPeriodEnd: false,
      planId: null,
      periodEnd: null,
      pricingModel: null,
      seats: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
    };
  }

  return {
    billingInterval:
      subscription.billingInterval === "month" ||
      subscription.billingInterval === "year"
        ? subscription.billingInterval
        : null,
    cancelAt: subscription.cancelAt ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
    planId: subscription.plan ?? null,
    periodEnd: subscription.periodEnd ?? null,
    pricingModel: toPricingModel(subscription.plan ?? null),
    seats: subscription.seats ?? null,
    stripeCustomerId: subscription.stripeCustomerId ?? null,
    stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
    subscriptionStatus: subscription.status ?? null,
  };
}
