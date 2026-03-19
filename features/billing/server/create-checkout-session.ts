import type { Stripe } from "stripe";

import { resolvePricingModelFromStripePriceId } from "@/features/billing/plans";
import { routes } from "@/shared/constants/routes";
import { stripe as defaultStripe } from "@/shared/lib/stripe/client";

type CreateCheckoutParams = {
  priceId: string;
  teamId: number;
  seatQuantity: number;
  stripeCustomerId: string | null;
  userEmail: string;
};

export async function createCheckoutSession(
  params: CreateCheckoutParams,
  deps = { stripe: defaultStripe },
) {
  const price = await deps.stripe.prices.retrieve(params.priceId, {
    expand: ["product"],
  });

  if (!price.active) {
    throw new Error("Selected Stripe price is not active.");
  }

  if (
    typeof price.product === "string" ||
    price.product.deleted ||
    !price.product.active
  ) {
    throw new Error("Selected Stripe product is invalid.");
  }

  const pricingModel = resolvePricingModelFromStripePriceId(params.priceId);
  const quantity = pricingModel === "per_seat" ? Math.max(1, params.seatQuantity) : 1;
  const commonParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: [{ price: params.priceId, quantity }],
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}${routes.marketing.pricing}`,
    customer: params.stripeCustomerId || undefined,
    customer_email: params.stripeCustomerId ? undefined : params.userEmail,
    allow_promotion_codes: true,
    metadata: {
      teamId: params.teamId.toString(),
    },
  };

  if (pricingModel === "one_time") {
    const session = await deps.stripe.checkout.sessions.create({
      ...commonParams,
      mode: "payment",
    });
    return session.url!;
  }

  let trialPeriodDays = price.recurring?.trial_period_days ?? null;

  if (trialPeriodDays && params.stripeCustomerId) {
    const previousSubscriptions = await deps.stripe.subscriptions.list({
      customer: params.stripeCustomerId,
      status: "all",
      limit: 1,
    });

    if (previousSubscriptions.data.length > 0) {
      trialPeriodDays = null;
    }
  }

  const session = await deps.stripe.checkout.sessions.create({
    ...commonParams,
    mode: "subscription",
    subscription_data: trialPeriodDays
      ? {
          trial_period_days: trialPeriodDays,
        }
      : undefined,
  });

  return session.url!;
}
