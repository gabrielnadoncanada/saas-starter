import {
  checkoutSettings,
  type BillingInterval,
  type PlanId,
} from "@/config/billing.config";
import { routes } from "@/constants/routes";
import {
  buildPlanCheckoutLineItems,
  getPlan,
  SUBSCRIPTION_EXISTS_STATUSES,
} from "@/features/billing/plans";
import { db } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";

import { ensureStripeCustomer } from "./stripe-customers";

async function assertNoActiveSubscription(organizationId: string) {
  const currentSubscription = await db.subscription.findFirst({
    where: {
      referenceId: organizationId,
      status: { in: [...SUBSCRIPTION_EXISTS_STATUSES] },
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (currentSubscription) {
    throw new Error(
      "Existing subscriptions must be updated from billing checkoutSettings.",
    );
  }
}

export async function createSubscriptionCheckout(params: {
  billingInterval: BillingInterval;
  organizationId: string;
  planId: PlanId;
}) {
  const plan = getPlan(params.planId);
  const lineItems = buildPlanCheckoutLineItems(params);

  if (plan.id === "free" || lineItems.length === 0) {
    throw new Error("Invalid billing selection.");
  }

  await assertNoActiveSubscription(params.organizationId);

  const customerId = await ensureStripeCustomer(params.organizationId);
  const trialDays =
    plan.intervalPricing[params.billingInterval]?.lineItems[0]?.price.trialDays;
  const metadata = {
    billingInterval: params.billingInterval,
    checkoutType: "subscription",
    organizationId: params.organizationId,
    planId: plan.id,
  };
  const billingBase = process.env.BASE_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    allow_promotion_codes: true,
    billing_address_collection: checkoutSettings.billingAddressRequired
      ? "required"
      : undefined,
    automatic_tax: checkoutSettings.automaticTax ? { enabled: true } : undefined,
    tax_id_collection: checkoutSettings.taxIdCollection ? { enabled: true } : undefined,
    payment_method_collection: checkoutSettings.trialWithoutCard
      ? "if_required"
      : undefined,
    client_reference_id: params.organizationId,
    line_items: lineItems,
    success_url: new URL(
      `${routes.settings.billing}?checkout=success`,
      billingBase,
    ).toString(),
    cancel_url: new URL(
      `${routes.settings.billing}?checkout=cancelled`,
      billingBase,
    ).toString(),
    metadata,
    subscription_data: {
      metadata,
      trial_period_days: trialDays,
    },
  });

  if (!session.url) {
    throw new Error("Stripe Checkout did not return a redirect URL.");
  }

  return session.url;
}
