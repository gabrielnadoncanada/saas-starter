import Stripe from "stripe";

import { resolvePricingModel } from "@/features/billing/plans";
import { db as defaultDb } from "@/shared/lib/db/prisma";
import { stripe as defaultStripe } from "@/shared/lib/stripe/client";

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

  const userId = session.client_reference_id;
  if (!userId) {
    throw new Error("No user ID found in session's client_reference_id.");
  }

  const user = await deps.db.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user) {
    throw new Error("User not found in database.");
  }

  const userTeam = await deps.db.teamMember.findFirst({
    where: { userId: user.id },
    select: { teamId: true },
  });

  if (!userTeam) {
    throw new Error("User is not associated with any team.");
  }

  // One-time payment flow
  if (session.mode === "payment") {
    const lineItems = await deps.stripe.checkout.sessions.listLineItems(
      sessionId,
      { expand: ["data.price.product"] },
    );

    const firstItem = lineItems.data[0];
    const product = firstItem?.price?.product as Stripe.Product | undefined;

    if (!product) {
      throw new Error("No product found for this payment session.");
    }

    await deps.db.team.update({
      where: { id: userTeam.teamId },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: null,
        stripeProductId: product.id,
        planName: product.name,
        subscriptionStatus: "lifetime",
        pricingModel: "one_time",
      },
    });

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

  const product = plan.product as Stripe.Product;
  if (!product.id) {
    throw new Error("No product ID found for this subscription.");
  }

  const pricingModel = resolvePricingModel(product.metadata);

  await deps.db.team.update({
    where: { id: userTeam.teamId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripeProductId: product.id,
      planName: product.name,
      subscriptionStatus: subscription.status,
      pricingModel,
    },
  });
}
