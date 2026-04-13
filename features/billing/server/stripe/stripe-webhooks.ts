import type Stripe from "stripe";

import {
  findCatalogPrice,
  isPlanId,
} from "@/features/billing/plans";
import type { BillingInterval } from "@/shared/config/billing.config";
import { logActivity } from "@/shared/lib/activity/log-activity";
import { db } from "@/shared/lib/db/prisma";

import {
  clearBillingState,
  findOrganizationByCustomer,
  syncStripeCustomer,
} from "./stripe-customers";

function toDate(timestamp: number | null | undefined) {
  return timestamp ? new Date(timestamp * 1000) : null;
}

function toBillingInterval(
  interval: Stripe.Price.Recurring.Interval | null | undefined,
): BillingInterval | null {
  return interval === "month" || interval === "year" ? interval : null;
}

function getPrimarySubscriptionItem(subscription: Stripe.Subscription) {
  return subscription.items.data[0] ?? null;
}

function resolvePlanId(subscription: Stripe.Subscription) {
  if (isPlanId(subscription.metadata.planId)) {
    return subscription.metadata.planId;
  }

  for (const item of subscription.items.data) {
    const catalogItem = findCatalogPrice(item.price.id);

    if (catalogItem?.itemType === "plan" && isPlanId(catalogItem.itemKey)) {
      return catalogItem.itemKey;
    }
  }

  return null;
}

async function resolveOrganizationId(subscription: Stripe.Subscription) {
  if (subscription.metadata.organizationId) {
    return subscription.metadata.organizationId;
  }

  if (typeof subscription.customer !== "string") {
    return null;
  }

  return findOrganizationByCustomer(subscription.customer);
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const organizationId = await resolveOrganizationId(subscription);
  const planId = resolvePlanId(subscription);
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : null;

  if (!organizationId || !planId || !customerId) {
    return;
  }

  await syncStripeCustomer({
    organizationId,
    customerId,
  });
  const primaryItem = getPrimarySubscriptionItem(subscription);
  const existing = await db.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
    select: { id: true },
  });
  const subscriptionId = existing?.id ?? subscription.id;
  const subscriptionRecord = {
    billingInterval: toBillingInterval(primaryItem?.price?.recurring?.interval),
    cancelAt: toDate(subscription.cancel_at),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: toDate(subscription.canceled_at),
    endedAt: toDate(subscription.ended_at),
    periodEnd: toDate(primaryItem?.current_period_end),
    periodStart: toDate(primaryItem?.current_period_start),
    plan: planId,
    referenceId: organizationId,
    status: subscription.status,
    stripeCustomerId: customerId,
    stripePriceId: primaryItem?.price?.id ?? null,
    stripeSubscriptionId: subscription.id,
    stripeSubscriptionItemId: primaryItem?.id ?? null,
    trialEnd: toDate(subscription.trial_end),
    trialStart: toDate(subscription.trial_start),
  };

  await db.subscription.upsert({
    where: { id: subscriptionId },
    update: subscriptionRecord,
    create: { id: subscriptionId, ...subscriptionRecord },
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId =
    session.metadata?.organizationId ?? session.client_reference_id;
  const customerId =
    typeof session.customer === "string" ? session.customer : null;

  if (!organizationId || !customerId) {
    return;
  }

  await syncStripeCustomer({ organizationId, customerId });
}

async function handleCustomerDeleted(customer: Stripe.Customer) {
  await clearBillingState(customer.id);
}

async function logSubscriptionActivity(
  event: Stripe.Event,
  subscription: Stripe.Subscription,
) {
  const organizationId = await resolveOrganizationId(subscription);
  if (!organizationId) return;

  const planId = resolvePlanId(subscription);
  const action =
    event.type === "customer.subscription.created"
      ? "subscription.created"
      : "subscription.cancelled";

  await logActivity({
    action,
    organizationId,
    targetType: "subscription",
    targetId: subscription.id,
    metadata: { planId, status: subscription.status },
  });
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      return;
    case "customer.deleted":
      await handleCustomerDeleted(event.data.object as Stripe.Customer);
      return;
    case "customer.subscription.created":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription);
      await logSubscriptionActivity(event, subscription);
      return;
    }
    case "customer.subscription.updated":
      await syncSubscription(event.data.object as Stripe.Subscription);
      return;
    default:
      return;
  }
}
