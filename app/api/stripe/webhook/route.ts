import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

import { handleSubscriptionChange } from "@/features/billing/server/handle-subscription-change";
import { finalizeCheckoutSession } from "@/features/billing/server/finalize-checkout";
import { stripe } from "@/shared/lib/stripe/client";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    }
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await finalizeCheckoutSession(session.id);
      break;
    }
    case "invoice.payment_action_required":
    case "invoice.payment_failed":
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const sub = invoice.parent?.subscription_details?.subscription;
      const subscriptionId =
        typeof sub === "string" ? sub : sub?.id;
      if (subscriptionId) {
        if (event.type === "invoice.payment_action_required") {
          console.warn("Stripe invoice requires customer action", {
            invoiceId: invoice.id,
            subscriptionId,
          });
        }
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        await handleSubscriptionChange(subscription);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
