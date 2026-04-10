import {
  buildPlanCheckoutLineItems,
  getOneTimeProduct,
  getPlan,
} from "@/features/billing/catalog";
import { CURRENT_SUBSCRIPTION_STATUSES } from "@/features/billing/plan-guards";
import type { BillingInterval, PlanId } from "@/shared/config/billing.config";
import { routes } from "@/shared/constants/routes";
import { db } from "@/shared/lib/db/prisma";
import { stripe } from "@/shared/lib/stripe/client";

import { ensureOrganizationStripeCustomer } from "./stripe-customers";

function getBooleanEnv(name: string, defaultValue = false) {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return defaultValue;
}

function getCheckoutSettings() {
  const automaticTax = getBooleanEnv("ENABLE_AUTOMATIC_TAX_CALCULATION");
  const taxIdCollection = getBooleanEnv("ENABLE_TAX_ID_COLLECTION");
  const billingAddressRequired = getBooleanEnv(
    "STRIPE_REQUIRE_BILLING_ADDRESS",
    automaticTax || taxIdCollection,
  );

  return {
    automaticTax,
    billingAddressRequired,
    taxIdCollection,
    trialWithoutCard: getBooleanEnv("STRIPE_ENABLE_TRIAL_WITHOUT_CC"),
  };
}

async function assertNoActiveSubscription(organizationId: string) {
  const currentSubscription = await db.subscription.findFirst({
    where: {
      referenceId: organizationId,
      status: { in: [...CURRENT_SUBSCRIPTION_STATUSES] },
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (currentSubscription) {
    throw new Error(
      "Existing subscriptions must be updated from billing settings.",
    );
  }
}

export async function createOrganizationSubscriptionCheckoutSession(params: {
  billingInterval: BillingInterval;
  organizationId: string;
  planId: PlanId;
  seatQuantity: number;
}) {
  const plan = getPlan(params.planId);
  const lineItems = buildPlanCheckoutLineItems(params);

  if (plan.id === "free" || lineItems.length === 0) {
    throw new Error("Invalid billing selection.");
  }

  await assertNoActiveSubscription(params.organizationId);

  const customerId = await ensureOrganizationStripeCustomer(
    params.organizationId,
  );
  const settings = getCheckoutSettings();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    allow_promotion_codes: true,
    billing_address_collection: settings.billingAddressRequired
      ? "required"
      : undefined,
    automatic_tax: settings.automaticTax ? { enabled: true } : undefined,
    tax_id_collection: settings.taxIdCollection ? { enabled: true } : undefined,
    payment_method_collection: settings.trialWithoutCard
      ? "if_required"
      : undefined,
    client_reference_id: params.organizationId,
    line_items: lineItems,
    success_url: new URL(
      `${routes.settings.billing}?checkout=success`,
      process.env.BASE_URL,
    ).toString(),
    cancel_url: new URL(routes.marketing.pricing, process.env.BASE_URL).toString(),
    metadata: {
      billingInterval: params.billingInterval,
      checkoutType: "subscription",
      organizationId: params.organizationId,
      planId: plan.id,
      seatQuantity: String(params.seatQuantity),
    },
    subscription_data: {
      metadata: {
        billingInterval: params.billingInterval,
        checkoutType: "subscription",
        organizationId: params.organizationId,
        planId: plan.id,
      },
      trial_period_days: lineItems.length > 0
        ? plan.schedules[params.billingInterval]?.lineItems[0]?.price.trialDays
        : undefined,
    },
  });

  if (!session.url) {
    throw new Error("Stripe Checkout did not return a redirect URL.");
  }

  return session.url;
}

export async function createOrganizationOneTimeCheckoutSession(params: {
  itemKey: string;
  organizationId: string;
}) {
  const item = getOneTimeProduct(params.itemKey);

  if (!item?.price) {
    throw new Error("Invalid one-time product selection.");
  }

  const customerId = await ensureOrganizationStripeCustomer(
    params.organizationId,
  );
  const settings = getCheckoutSettings();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    allow_promotion_codes: true,
    billing_address_collection: settings.billingAddressRequired
      ? "required"
      : undefined,
    automatic_tax: settings.automaticTax ? { enabled: true } : undefined,
    tax_id_collection: settings.taxIdCollection ? { enabled: true } : undefined,
    client_reference_id: params.organizationId,
    line_items: [{ price: item.price.priceId, quantity: 1 }],
    success_url: new URL(
      `${routes.settings.billing}?purchase=success`,
      process.env.BASE_URL,
    ).toString(),
    cancel_url: new URL(routes.settings.billing, process.env.BASE_URL).toString(),
    metadata: {
      checkoutType: "one_time_product",
      itemKey: params.itemKey,
      organizationId: params.organizationId,
    },
  });

  if (!session.url) {
    throw new Error("Stripe Checkout did not return a redirect URL.");
  }

  return session.url;
}
