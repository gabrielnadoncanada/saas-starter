import type Stripe from "stripe";

import type { BillingInterval } from "@/config/billing.config";
import {
  findCatalogPrice,
  isPlanId,
} from "@/features/billing/plans";
import { logActivity } from "@/lib/activity/log-activity";
import { db } from "@/lib/db/prisma";

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

  await syncStripeCustomer({ organizationId, customerId });

  const primaryItem = subscription.items.data[0] ?? null;
  const existing = await db.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
    select: { id: true },
  });
  const subscriptionId = existing?.id ?? subscription.id;
  const record = {
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
    update: record,
    create: { id: subscriptionId, ...record },
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
  action:
    | "subscription.created"
    | "subscription.updated"
    | "subscription.cancelled",
  subscription: Stripe.Subscription,
) {
  const organizationId = await resolveOrganizationId(subscription);
  if (!organizationId) return;

  await logActivity({
    action,
    organizationId,
    targetType: "subscription",
    targetId: subscription.id,
    metadata: {
      planId: resolvePlanId(subscription),
      status: subscription.status,
    },
  });
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      return;
    case "customer.deleted":
      await handleCustomerDeleted(event.data.object);
      return;
    case "customer.subscription.created":
      await syncSubscription(event.data.object);
      await logSubscriptionActivity(
        "subscription.created",
        event.data.object,
      );
      return;
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      await logSubscriptionActivity(
        "subscription.cancelled",
        event.data.object,
      );
      return;
    case "customer.subscription.updated":
      await syncSubscription(event.data.object);
      await logSubscriptionActivity("subscription.updated", event.data.object);
      return;
    default:
      return;
  }
}
