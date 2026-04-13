import type Stripe from "stripe";

import type {
  BillingInterval,
  PlanId,
} from "@/config/billing.config";
import {
  getPlan,
} from "@/features/billing/plans";
import { db } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";

// --- Subscription snapshot ---

export type SubscriptionSnapshot = {
  cancelAt: Date | null;
  cancelAtPeriodEnd: boolean;
  periodEnd: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  planId: string | null;
  billingInterval: BillingInterval | null;
  subscriptionStatus: string | null;
  trialEnd: Date | null;
};

const emptySnapshot: SubscriptionSnapshot = {
  billingInterval: null,
  cancelAt: null,
  cancelAtPeriodEnd: false,
  planId: null,
  periodEnd: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: null,
  trialEnd: null,
};

export async function getSubscriptionSnapshot(
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
    stripeCustomerId: sub.stripeCustomerId ?? null,
    stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
    planId: sub.plan,
    billingInterval:
      sub.billingInterval === "month" || sub.billingInterval === "year"
        ? sub.billingInterval
        : null,
    subscriptionStatus: sub.status ?? null,
    trialEnd: sub.trialEnd ?? null,
  };
}

// --- Subscription configuration update ---

export async function changeSubscription(params: {
  billingInterval: BillingInterval;
  organizationId: string;
  planId: PlanId;
}) {
  const subscriptionRecord = await db.subscription.findFirst({
    where: { referenceId: params.organizationId },
    orderBy: { updatedAt: "desc" },
    select: { stripeSubscriptionId: true, stripeSubscriptionItemId: true },
  });

  if (!subscriptionRecord?.stripeSubscriptionId) {
    throw new Error(
      "No synced Stripe subscription was found for this workspace.",
    );
  }

  const plan = getPlan(params.planId);
  const pricing = plan.intervalPricing[params.billingInterval];
  const lineItem = pricing?.lineItems[0];

  if (!lineItem) {
    throw new Error("Invalid billing selection.");
  }

  const items: Stripe.SubscriptionUpdateParams.Item[] = [
    {
      ...(subscriptionRecord.stripeSubscriptionItemId
        ? { id: subscriptionRecord.stripeSubscriptionItemId }
        : {}),
      price: lineItem.price.priceId,
      quantity: 1,
    },
  ];

  return stripe.subscriptions.update(subscriptionRecord.stripeSubscriptionId, {
    items,
    metadata: {
      billingInterval: params.billingInterval,
      checkoutType: "subscription",
      organizationId: params.organizationId,
      planId: params.planId,
    },
    proration_behavior: "create_prorations",
  });
}
