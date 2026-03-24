import { isPlanId, plans, type PlanId, type PricingModel } from "@/features/billing/plans";
import { resolveRecurringSelectionFromPriceId } from "@/features/billing/server/recurring-selection";
import { routes } from "@/shared/constants/routes";
import { auth } from "@/shared/lib/auth";

type SubscriptionSnapshot = {
  billingInterval: string | null;
  planId: string | null;
  pricingModel: PricingModel | null;
  seats: number | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
};

export async function createOrganizationCheckoutSession(params: {
  organizationId: string;
  priceId: string;
  reqHeaders: Headers;
  seatQuantity: number;
}) {
  const selection = resolveRecurringSelectionFromPriceId(params.priceId);
  if (!selection) {
    throw new Error("Invalid recurring Stripe price selected.");
  }

  const checkout = await auth.api.upgradeSubscription({
    headers: params.reqHeaders,
    body: {
      plan: selection.planId,
      customerType: "organization",
      referenceId: params.organizationId,
      seats: Math.max(1, params.seatQuantity),
      successUrl: `${process.env.BASE_URL}${routes.app.dashboard}`,
      cancelUrl: `${process.env.BASE_URL}${routes.marketing.pricing}`,
      disableRedirect: true,
    },
  });

  if (!checkout.url) {
    throw new Error("Better Auth did not return a Stripe Checkout URL.");
  }

  return checkout.url;
}

export async function createOrganizationBillingPortalSession(params: {
  organizationId: string;
  reqHeaders: Headers;
}) {
  const portal = await auth.api.createBillingPortal({
    headers: params.reqHeaders,
    body: {
      customerType: "organization",
      referenceId: params.organizationId,
      returnUrl: `${process.env.BASE_URL}${routes.app.dashboard}`,
      disableRedirect: true,
    },
  });

  if (!portal.url) {
    throw new Error("Better Auth did not return a Stripe Billing Portal URL.");
  }

  return portal.url;
}

export async function getOrganizationSubscriptionSnapshot(
  organizationId: string,
  reqHeaders: Headers,
): Promise<SubscriptionSnapshot> {
  const subscriptions = await auth.api.listActiveSubscriptions({
    headers: reqHeaders,
    query: { referenceId: organizationId, customerType: "organization" },
  });

  const subscription = subscriptions?.[0];

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

  const planId = subscription.plan && isPlanId(subscription.plan) && subscription.plan !== "free"
    ? subscription.plan
    : null;

  return {
    billingInterval: subscription.billingInterval ?? null,
    planId,
    pricingModel: planId ? plans[planId as PlanId].pricingModel : null,
    seats: subscription.seats ?? null,
    stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
    subscriptionStatus: subscription.status ?? null,
  };
}
