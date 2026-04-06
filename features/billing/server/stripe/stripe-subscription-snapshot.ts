import type { Subscription } from "@prisma/client";

import { getPlan, isPlanId } from "@/features/billing/catalog";
import {
  type BillingInterval,
  type PricingModel,
} from "@/shared/config/billing.config";
import { db } from "@/shared/lib/db/prisma";

type SubscriptionSnapshot = Pick<
  Subscription,
  "cancelAt" | "periodEnd" | "seats" | "stripeCustomerId" | "stripeSubscriptionId"
> & {
  cancelAtPeriodEnd: boolean;
  plan: string | null;
  billingInterval: BillingInterval | null;
  subscriptionStatus: string | null;
  pricingModel: PricingModel | null;
};

function toPricingModel(plan: string | null): PricingModel | null {
  if (!plan || !isPlanId(plan)) {
    return null;
  }

  return getPlan(plan).pricingModel;
}

function subscriptionRowToSnapshot(
  subscription: Subscription,
): SubscriptionSnapshot {
  return {
    cancelAt: subscription.cancelAt ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
    periodEnd: subscription.periodEnd ?? null,
    seats: subscription.seats ?? null,
    stripeCustomerId: subscription.stripeCustomerId ?? null,
    stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
    plan: subscription.plan ?? null,
    billingInterval:
      subscription.billingInterval === "month" ||
      subscription.billingInterval === "year"
        ? subscription.billingInterval
        : null,
    subscriptionStatus: subscription.status ?? null,
    pricingModel: toPricingModel(subscription.plan ?? null),
  };
}

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
  const subscription = await db.subscription.findFirst({
    where: { referenceId: organizationId },
    orderBy: [{ updatedAt: "desc" }],
  });

  if (!subscription) {
    return emptySnapshot;
  }

  return subscriptionRowToSnapshot(subscription);
}
