import Stripe from "stripe";
import type { Prisma } from "@prisma/client";

import {
  isTerminalStripeSubscriptionStatus,
  resolvePlanFromStripePriceId,
  resolvePricingModelFromStripePriceId,
} from "@/features/billing/plans";
import { releaseCheckoutForTeam } from "@/features/billing/server/checkout-lock";
import { syncSeatQuantity } from "@/features/billing/server/sync-seat-quantity";
import { db as defaultDb } from "@/shared/lib/db/prisma";
import { stripe as defaultStripe } from "@/shared/lib/stripe/client";

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function hasConflictingActiveSubscription(team: {
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
}, subscriptionId: string) {
  return (
    !!team.stripeSubscriptionId &&
    team.stripeSubscriptionId !== subscriptionId &&
    !isTerminalStripeSubscriptionStatus(team.subscriptionStatus)
  );
}

export async function finalizeCheckoutSession(
  sessionId: string,
  deps = { db: defaultDb, stripe: defaultStripe },
) {
  const session = await deps.stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["customer", "subscription"],
  });

  if (!session.customer || typeof session.customer === "string") {
    throw new Error("Invalid customer data from Stripe.");
  }

  const customerId = session.customer.id;

  const teamId = Number(session.metadata?.teamId);
  if (!Number.isInteger(teamId) || teamId <= 0) {
    throw new Error("No valid team ID found in session metadata.");
  }

  const team = await deps.db.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error("Team not found in database.");
  }

  async function runOnce(
    work: (
      tx: Prisma.TransactionClient,
      lockedTeam: {
        stripeSubscriptionId: string | null;
        subscriptionStatus: string | null;
      },
    ) => Promise<void>,
  ) {
    return deps.db.$transaction(async (tx) => {
      try {
        await tx.processedStripeCheckout.create({
          data: {
            sessionId,
            teamId,
          },
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          return false;
        }

        throw error;
      }

      await tx.$queryRaw`SELECT id FROM "Team" WHERE id = ${teamId} FOR UPDATE`;

      const lockedTeam = await tx.team.findUnique({
        where: { id: teamId },
        select: {
          stripeSubscriptionId: true,
          subscriptionStatus: true,
        },
      });

      if (!lockedTeam) {
        throw new Error("Team not found in database.");
      }

      await work(tx, lockedTeam);

      return true;
    });
  }

  // One-time payment flow
  if (session.mode === "payment") {
    const lineItems = await deps.stripe.checkout.sessions.listLineItems(
      sessionId,
      { expand: ["data.price.product"] },
    );

    const firstItem = lineItems.data[0];
    const priceId = firstItem?.price?.id;
    const product = firstItem?.price?.product as Stripe.Product | undefined;

    if (!product || !priceId) {
      throw new Error("No configured price found for this payment session.");
    }

    const wasProcessed = await runOnce(async (tx) => {
      await tx.team.update({
        where: { id: teamId },
        data: {
          planId: resolvePlanFromStripePriceId(priceId),
          stripeCustomerId: customerId,
          stripeSubscriptionId: null,
          stripeProductId: product.id,
          subscriptionStatus: "lifetime",
          pricingModel: "one_time",
          pendingCheckoutPriceId: null,
          pendingCheckoutStartedAt: null,
        },
      });
    });

    if (!wasProcessed) {
      return;
    }

    return;
  }

  // Subscription flow (flat / per_seat)
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) {
    throw new Error("No subscription found for this session.");
  }

  const subscription = await deps.stripe.subscriptions.retrieve(
    subscriptionId,
    { expand: ["items.data.price.product"] },
  );

  const plan = subscription.items.data[0]?.price;
  if (!plan) {
    throw new Error("No plan found for this subscription.");
  }

  const planPriceId = plan.id;
  const product = plan.product as Stripe.Product;
  if (!product.id || !planPriceId) {
    throw new Error("No product ID found for this subscription.");
  }

  const pricingModel = resolvePricingModelFromStripePriceId(planPriceId);

  const wasProcessed = await runOnce(async (tx, lockedTeam) => {
    if (hasConflictingActiveSubscription(lockedTeam, subscriptionId)) {
      throw new Error("Team already has an active subscription.");
    }

    await tx.team.update({
      where: { id: teamId },
      data: {
        planId: resolvePlanFromStripePriceId(planPriceId),
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripeProductId: product.id,
        subscriptionStatus: subscription.status,
        pricingModel,
      },
    });

    await releaseCheckoutForTeam(teamId, tx);
  });

  if (!wasProcessed) {
    return;
  }

  if (pricingModel === "per_seat") {
    await syncSeatQuantity(teamId, deps);
  }
}
