import type Stripe from "stripe";

import {
  findCatalogRecurringPriceByPriceId,
  isPlanId,
} from "@/features/billing/plans";
import { syncSubscriptionItems } from "@/features/billing/server/stripe/stripe-subscriptions";
import type { BillingInterval } from "@/shared/config/billing.config";
import { db } from "@/shared/lib/db/prisma";

import {
  clearStripeCustomerBillingState,
  findOrganizationIdByStripeCustomerId,
  syncOrganizationStripeCustomer,
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
    const catalogItem = findCatalogRecurringPriceByPriceId(item.price.id);

    if (catalogItem?.itemType === "plan" && isPlanId(catalogItem.itemKey)) {
      return catalogItem.itemKey;
    }
  }

  return null;
}

async function resolveReferenceId(subscription: Stripe.Subscription) {
  if (subscription.metadata.organizationId) {
    return subscription.metadata.organizationId;
  }

  if (typeof subscription.customer !== "string") {
    return null;
  }

  return findOrganizationIdByStripeCustomerId(subscription.customer);
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const referenceId = await resolveReferenceId(subscription);
  const planId = resolvePlanId(subscription);
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : null;

  if (!referenceId || !planId || !customerId) {
    return;
  }

  await syncOrganizationStripeCustomer({
    organizationId: referenceId,
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
    referenceId,
    seats: primaryItem?.quantity ?? null,
    status: subscription.status,
    stripeCustomerId: customerId,
    stripeScheduleId:
      typeof subscription.schedule === "string"
        ? subscription.schedule
        : (subscription.schedule?.id ?? null),
    stripeSubscriptionId: subscription.id,
    trialEnd: toDate(subscription.trial_end),
    trialStart: toDate(subscription.trial_start),
  };

  await db.subscription.upsert({
    where: { id: subscriptionId },
    update: subscriptionRecord,
    create: { id: subscriptionId, ...subscriptionRecord },
  });

  await syncSubscriptionItems(subscriptionId, subscription);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId =
    session.metadata?.organizationId ?? session.client_reference_id;
  const customerId =
    typeof session.customer === "string" ? session.customer : null;

  if (!organizationId || !customerId) {
    return;
  }

  await syncOrganizationStripeCustomer({ organizationId, customerId });

  if (session.mode === "payment") {
    const itemKey = session.metadata?.itemKey ?? null;

    await db.purchase.upsert({
      where: { stripeCheckoutSessionId: session.id },
      update: { status: "completed" },
      create: {
        organizationId,
        purchaseType: "one_time_product",
        itemKey: itemKey ?? "unknown",
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        stripeCustomerId: customerId,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        status: "completed",
      },
    });
  }
}

async function handleCustomerDeleted(customer: Stripe.Customer) {
  await clearStripeCustomerBillingState(customer.id);
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
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object as Stripe.Subscription);
      return;
    default:
      return;
  }
}
