import {
  getPlan,
  isPlanId,
  type BillingInterval,
  type PricingModel,
} from "@/features/billing/plans";
import { db } from "@/shared/lib/db/prisma";

type SubscriptionSnapshot = {
  billingInterval: BillingInterval | null;
  planId: string | null;
  pricingModel: PricingModel | null;
  seats: number | null;
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
      planId: null,
      pricingModel: null,
      seats: null,
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
    planId: subscription.plan ?? null,
    pricingModel: toPricingModel(subscription.plan ?? null),
    seats: subscription.seats ?? null,
    stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
    subscriptionStatus: subscription.status ?? null,
  };
}
