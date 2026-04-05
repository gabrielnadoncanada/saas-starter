import type Stripe from "stripe";

import {
  findCatalogRecurringPriceByPriceId,
  getAddon,
  getCreditPack,
  getPlan,
  isPlanId,
} from "@/features/billing/catalog/resolver";
import { grantCredits } from "@/features/billing/server/credits";
import { syncSubscriptionItems } from "@/features/billing/server/stripe/stripe-subscription-items";
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

function resolveAddonIds(subscription: Stripe.Subscription) {
  const addonIds = new Set<string>();

  for (const item of subscription.items.data) {
    const catalogItem = findCatalogRecurringPriceByPriceId(item.price.id);

    if (catalogItem?.itemType === "addon" && getAddon(catalogItem.itemKey)) {
      addonIds.add(catalogItem.itemKey);
    }
  }

  return [...addonIds];
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

async function grantSubscriptionCredits(params: {
  addonIds: string[];
  organizationId: string;
  periodEnd: Date | null;
  periodStart: Date | null;
  planId: string;
  stripeSubscriptionId: string;
}) {
  if (!isPlanId(params.planId) || !params.periodStart) {
    return;
  }

  const plan = getPlan(params.planId);
  const includedMonthlyCredits =
    plan.includedMonthlyCredits +
    params.addonIds.reduce(
      (total, addonId) => total + (getAddon(addonId)?.includedMonthlyCredits ?? 0),
      0,
    );

  if (includedMonthlyCredits <= 0) {
    return;
  }

  await grantCredits({
    organizationId: params.organizationId,
    sourceKey: `${params.stripeSubscriptionId}:${params.periodStart.toISOString()}`,
    sourceType: "subscription_cycle",
    creditsGranted: includedMonthlyCredits,
    expiresAt: params.periodEnd,
    reason: "subscription_cycle_credit_grant",
    referenceId: params.stripeSubscriptionId,
    referenceType: "subscription",
  });
}

async function syncSubscription(subscription: Stripe.Subscription, eventType: string) {
  const referenceId = await resolveReferenceId(subscription);
  const planId = resolvePlanId(subscription);
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : null;

  if (!referenceId || !planId || !customerId) {
    return;
  }

  await syncOrganizationStripeCustomer({ organizationId: referenceId, customerId });
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
  await grantSubscriptionCredits({
    addonIds: resolveAddonIds(subscription),
    organizationId: referenceId,
    periodEnd: subscriptionRecord.periodEnd,
    periodStart: subscriptionRecord.periodStart,
    planId,
    stripeSubscriptionId: subscription.id,
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

  await syncOrganizationStripeCustomer({ organizationId, customerId });

  if (session.mode === "payment") {
    const itemKey = session.metadata?.itemKey ?? null;
    const checkoutType = session.metadata?.checkoutType;

    await db.purchase.upsert({
      where: { stripeCheckoutSessionId: session.id },
      update: { status: "completed" },
      create: {
        organizationId,
        purchaseType: checkoutType === "credit_pack" ? "credit_pack" : "one_time_product",
        itemKey: itemKey ?? "unknown",
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        stripeCustomerId: customerId,
        amount: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        status: "completed",
      },
    });

    if (checkoutType === "credit_pack" && itemKey) {
      const creditPack = getCreditPack(itemKey);

      if (creditPack) {
        await grantCredits({
          organizationId,
          sourceKey: session.id,
          sourceType: "credit_pack",
          creditsGranted: creditPack.creditsGranted,
          reason: "credit_pack_purchase",
          referenceId: session.id,
          referenceType: "checkout",
        });
      }
    }
  }
}

async function handleCustomerDeleted(customer: Stripe.Customer) {
  await clearStripeCustomerBillingState(customer.id);
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      return;
    case "customer.deleted":
      await handleCustomerDeleted(event.data.object as Stripe.Customer);
      return;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object as Stripe.Subscription, event.type);
      return;
    default:
      return;
  }
}
