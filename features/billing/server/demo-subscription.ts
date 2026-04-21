import { addDays } from "date-fns";

import type { BillingInterval, PlanId } from "@/config/billing.config";
import { getPlanDisplayPrice } from "@/features/billing/plans";
import { db } from "@/lib/db/prisma";

const DEMO_STRIPE_CUSTOMER_ID = "cus_demo";
const DEMO_PERIOD_DAYS_MONTH = 30;
const DEMO_PERIOD_DAYS_YEAR = 365;

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
  const periodDays =
    params.billingInterval === "year"
      ? DEMO_PERIOD_DAYS_YEAR
      : DEMO_PERIOD_DAYS_MONTH;
  const demoId = `sub_demo_${params.organizationId}`;

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
    stripeSubscriptionId: demoId,
    stripePriceId: price.priceId || `price_demo_${params.planId}`,
    stripeSubscriptionItemId: `si_demo_${params.organizationId}`,
    periodStart: now,
    periodEnd: addDays(now, periodDays),
    trialStart: null,
    trialEnd: null,
    cancelAtPeriodEnd: false,
    cancelAt: null,
    canceledAt: null,
    endedAt: null,
  };

  await db.subscription.upsert({
    where: { id: existing?.id ?? demoId },
    update: data,
    create: { id: demoId, ...data },
  });
}
