import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { handleStripeWebhookEvent } from "@/features/billing/server/stripe/stripe-webhooks";
import { stripe } from "@/shared/lib/stripe/client";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid Stripe webhook payload.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  await handleStripeWebhookEvent(event);

  return NextResponse.json({ received: true });
}
