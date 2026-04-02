import {
  type BillingInterval,
  getPlan,
  getPlanPrice,
  type PaidPlanId,
} from "@/shared/config/billing.config";
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

export async function createOrganizationCheckoutSession(params: {
  billingInterval: BillingInterval;
  organizationId: string;
  planId: PaidPlanId;
  seatQuantity: number;
}) {
  const plan = getPlan(params.planId);
  const price = getPlanPrice(params.planId, params.billingInterval);

  if (plan.id === "free" || !price) {
    throw new Error("Invalid billing selection.");
  }

  const currentSubscription = await db.subscription.findFirst({
    where: {
      referenceId: params.organizationId,
      status: {
        in: [
          "active",
          "trialing",
          "past_due",
          "incomplete",
          "unpaid",
          "paused",
        ],
      },
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (currentSubscription) {
    throw new Error(
      "Existing subscriptions must be changed from the Stripe billing portal.",
    );
  }

  const customerId = await ensureOrganizationStripeCustomer(
    params.organizationId,
  );
  const settings = getCheckoutSettings();
  const quantity =
    plan.pricingModel === "per_seat" ? Math.max(1, params.seatQuantity) : 1;

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
    line_items: [{ price: price.priceId, quantity }],
    success_url: `${process.env.BASE_URL}${routes.settings.billing}?checkout=success`,
    cancel_url: `${process.env.BASE_URL}${routes.marketing.pricing}`,
    metadata: {
      organizationId: params.organizationId,
      billingInterval: params.billingInterval,
      planId: plan.id,
    },
    subscription_data: {
      metadata: {
        organizationId: params.organizationId,
        billingInterval: params.billingInterval,
        planId: plan.id,
      },
      trial_period_days: price.trialDays,
    },
  });

  if (!session.url) {
    throw new Error("Stripe Checkout did not return a redirect URL.");
  }

  return session.url;
}
