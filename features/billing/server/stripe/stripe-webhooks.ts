import type Stripe from "stripe";
import {
  findPlanPriceByPriceId,
  isPlanId,
  type BillingInterval,
} from "@/features/billing/plans";
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

function getPrimaryItem(subscription: Stripe.Subscription) {
  return subscription.items.data[0] ?? null;
}

function resolvePlanId(subscription: Stripe.Subscription) {
  const priceId = getPrimaryItem(subscription)?.price?.id;
  if (priceId) {
    const planIdFromPrice = findPlanPriceByPriceId(priceId)?.plan.id ?? null;

    if (planIdFromPrice) {
      return planIdFromPrice;
    }
  }

  if (isPlanId(subscription.metadata.planId)) {
    return subscription.metadata.planId;
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
    console.warn("[billing:subscription.sync.skipped]", {
      stripeSubscriptionId: subscription.id,
      hasCustomerId: Boolean(customerId),
      hasPlanId: Boolean(planId),
      hasReferenceId: Boolean(referenceId),
    });
    return;
  }

  await syncOrganizationStripeCustomer({
    organizationId: referenceId,
    customerId,
  });

  const item = getPrimaryItem(subscription);
  const existing = await db.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
    select: { id: true },
  });
  const subscriptionRecord = {
    plan: planId,
    referenceId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    periodStart: toDate(item?.current_period_start),
    periodEnd: toDate(item?.current_period_end),
    trialStart: toDate(subscription.trial_start),
    trialEnd: toDate(subscription.trial_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    cancelAt: toDate(subscription.cancel_at),
    canceledAt: toDate(subscription.canceled_at),
    endedAt: toDate(subscription.ended_at),
    seats: item?.quantity ?? null,
    billingInterval: toBillingInterval(item?.price?.recurring?.interval),
    stripeScheduleId:
      typeof subscription.schedule === "string"
        ? subscription.schedule
        : subscription.schedule?.id ?? null,
  };

  await db.subscription.upsert({
    where: { id: existing?.id ?? subscription.id },
    update: subscriptionRecord,
    create: {
      id: existing?.id ?? subscription.id,
      ...subscriptionRecord,
    },
  });

  console.info("[billing:subscription.synced]", {
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    planId,
    referenceId,
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organizationId ?? session.client_reference_id;
  const customerId = typeof session.customer === "string" ? session.customer : null;

  if (!organizationId || !customerId) {
    return;
  }

  await syncOrganizationStripeCustomer({ organizationId, customerId });

  console.info("[billing:checkout.completed]", {
    organizationId,
    customerId,
    stripeSessionId: session.id,
  });
}

async function handleCustomerDeleted(customer: Stripe.Customer) {
  const result = await clearStripeCustomerBillingState(customer.id);

  console.info("[billing:customer.deleted]", {
    stripeCustomerId: customer.id,
    clearedOrganizations: result.clearedOrganizations,
    deletedSubscriptions: result.deletedSubscriptions,
  });
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
      await syncSubscription(event.data.object as Stripe.Subscription);
      return;
    case "invoice.payment_failed":
    case "customer.subscription.trial_will_end":
      console.info("[billing:stripe.event]", {
        type: event.type,
        id: event.id,
      });
      return;
    default:
      return;
  }
}
