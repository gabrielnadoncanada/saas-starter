import { addDays } from "date-fns";

import type { BillingInterval, PlanId } from "@/config/billing.config";
import { getPlanDisplayPrice } from "@/features/billing/plans";
import { db } from "@/lib/db/prisma";

const DEMO_STRIPE_CUSTOMER_ID = "cus_demo";
const DEMO_PERIOD_DAYS = 30;

export async function applyDemoSubscriptionChange(params: {
  billingInterval: BillingInterval;
  organizationId: string;
  planId: PlanId;
}) {
  const price = getPlanDisplayPrice(params.planId, params.billingInterval);
  if (!price) {
    throw new Error("Invalid billing selection.");
  }

  const now = new Date();
  const periodEnd = addDays(
    now,
    params.billingInterval === "year" ? 365 : DEMO_PERIOD_DAYS,
  );

  const existing = await db.subscription.findFirst({
    where: { referenceId: params.organizationId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  const data = {
    plan: params.planId,
    referenceId: params.organizationId,
    status: "active",
    billingInterval: params.billingInterval,
    stripeCustomerId: DEMO_STRIPE_CUSTOMER_ID,
    stripeSubscriptionId: `sub_demo_${params.organizationId}`,
    stripePriceId: price.priceId || `price_demo_${params.planId}`,
    stripeSubscriptionItemId: `si_demo_${params.organizationId}`,
    periodStart: now,
    periodEnd,
    trialStart: null,
    trialEnd: null,
    cancelAtPeriodEnd: false,
    cancelAt: null,
    canceledAt: null,
    endedAt: null,
  };

  if (existing) {
    await db.subscription.update({
      where: { id: existing.id },
      data,
    });
    return;
  }

  await db.subscription.create({
    data: {
      id: `sub_demo_${params.organizationId}`,
      ...data,
    },
  });
}
