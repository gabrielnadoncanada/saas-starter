import type { Stripe } from "stripe";

import type { PricingModel } from "@/features/billing/plans";
import { routes } from "@/shared/constants/routes";
import { stripe as defaultStripe } from "@/shared/lib/stripe/client";

type CreateCheckoutParams = {
  priceId: string;
  stripeCustomerId: string | null;
  userEmail: string;
  userId: number;
  pricingModel: PricingModel;
};

export async function createCheckoutSession(
  params: CreateCheckoutParams,
  deps = { stripe: defaultStripe },
) {
  const commonParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}${routes.marketing.pricing}`,
    customer: params.stripeCustomerId || undefined,
    customer_email: params.stripeCustomerId ? undefined : params.userEmail,
    client_reference_id: params.userId.toString(),
    allow_promotion_codes: true,
  };

  if (params.pricingModel === "one_time") {
    const session = await deps.stripe.checkout.sessions.create({
      ...commonParams,
      mode: "payment",
    });
    return session.url!;
  }

  // flat & per_seat both use subscription mode
  const session = await deps.stripe.checkout.sessions.create({
    ...commonParams,
    mode: "subscription",
    subscription_data: {
      trial_period_days: 14,
    },
  });

  return session.url!;
}
