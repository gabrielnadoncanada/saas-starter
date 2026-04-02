import type Stripe from "stripe";

import { recordAuditLog } from "@/features/audit/server/record-audit-log";
import { createNotificationsForUsers } from "@/features/notifications/server/notification-service";
import {
  type BillingInterval,
  findPlanPriceByPriceId,
  isPlanId,
} from "@/shared/config/billing.config";
import { db } from "@/shared/lib/db/prisma";

import {
  clearStripeCustomerBillingState,
  findOrganizationIdByStripeCustomerId,
  syncOrganizationStripeCustomer,
} from "./stripe-customers";

async function getOrganizationNotificationUserIds(organizationId: string) {
  const members = await db.member.findMany({
    where: { organizationId },
    select: { userId: true },
  });

  return members.map((member) => member.userId);
}

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

async function syncSubscription(
  subscription: Stripe.Subscription,
  eventType: Stripe.Event["type"],
) {
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
        : (subscription.schedule?.id ?? null),
  };

  await db.subscription.upsert({
    where: { id: existing?.id ?? subscription.id },
    update: subscriptionRecord,
    create: {
      id: existing?.id ?? subscription.id,
      ...subscriptionRecord,
    },
  });

  const userIds = await getOrganizationNotificationUserIds(referenceId);

  await Promise.all([
    recordAuditLog({
      organizationId: referenceId,
      event: `billing.${eventType}`,
      entityType: "subscription",
      entityId: subscription.id,
      summary: `Stripe subscription ${subscription.status} on ${planId}`,
      metadata: {
        customerId,
        planId,
        stripeSubscriptionId: subscription.id,
      },
    }),
    createNotificationsForUsers(referenceId, userIds, {
      type: `billing.${eventType}`,
      title: "Billing updated",
      body: `Workspace subscription is now ${subscription.status} on ${planId}.`,
    }),
  ]);

  console.info("[billing:subscription.synced]", {
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    planId,
    referenceId,
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
  const userIds = await getOrganizationNotificationUserIds(organizationId);

  await Promise.all([
    recordAuditLog({
      organizationId,
      event: "billing.checkout_completed",
      entityType: "checkout",
      entityId: session.id,
      summary: "Completed a Stripe checkout session",
      metadata: {
        customerId,
        stripeSessionId: session.id,
      },
    }),
    createNotificationsForUsers(organizationId, userIds, {
      type: "billing.checkout_completed",
      title: "Checkout completed",
      body: "Stripe checkout finished and billing is being synchronized.",
    }),
  ]);

  console.info("[billing:checkout.completed]", {
    organizationId,
    customerId,
    stripeSessionId: session.id,
  });
}

async function handleCustomerDeleted(customer: Stripe.Customer) {
  const organizationIds = await db.organization.findMany({
    where: { stripeCustomerId: customer.id },
    select: { id: true },
  });
  const result = await clearStripeCustomerBillingState(customer.id);

  await Promise.all(
    organizationIds.map(async ({ id }) => {
      const userIds = await getOrganizationNotificationUserIds(id);

      await Promise.all([
        recordAuditLog({
          organizationId: id,
          event: "billing.customer_deleted",
          entityType: "customer",
          entityId: customer.id,
          summary: "Stripe customer was deleted",
        }),
        createNotificationsForUsers(id, userIds, {
          type: "billing.customer_deleted",
          title: "Billing customer removed",
          body: "Stripe customer data was removed and billing access was cleared.",
        }),
      ]);
    }),
  );

  console.info("[billing:customer.deleted]", {
    stripeCustomerId: customer.id,
    clearedOrganizations: result.clearedOrganizations,
    deletedSubscriptions: result.deletedSubscriptions,
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
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object as Stripe.Subscription, event.type);
      return;
    case "invoice.payment_failed":
    case "customer.subscription.trial_will_end":
      if ("customer" in event.data.object) {
        const customerId =
          typeof event.data.object.customer === "string"
            ? event.data.object.customer
            : null;
        const organizationId = customerId
          ? await findOrganizationIdByStripeCustomerId(customerId)
          : null;

        if (organizationId) {
          const userIds = await getOrganizationNotificationUserIds(organizationId);

          await Promise.all([
            recordAuditLog({
              organizationId,
              event: `billing.${event.type}`,
              entityType: "billing_event",
              entityId: event.id,
              summary: `Stripe reported ${event.type}`,
            }),
            createNotificationsForUsers(organizationId, userIds, {
              type: `billing.${event.type}`,
              title: "Billing attention needed",
              body: `Stripe reported ${event.type.replaceAll(".", " ")}.`,
            }),
          ]);
        }
      }

      console.info("[billing:stripe.event]", {
        type: event.type,
        id: event.id,
      });
      return;
    default:
      return;
  }
}
