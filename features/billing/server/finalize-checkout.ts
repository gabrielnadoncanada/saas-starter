import Stripe from "stripe";

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

  const productId = (plan.product as Stripe.Product).id;
  if (!productId) {
    throw new Error("No product ID found for this subscription.");
  }

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

  await deps.db.team.update({
    where: { id: userTeam.teamId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripeProductId: productId,
      planName: (plan.product as Stripe.Product).name,
      subscriptionStatus: subscription.status,
    },
  });
}
