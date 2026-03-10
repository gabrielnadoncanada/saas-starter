import Stripe from 'stripe';

import { stripe as defaultStripe } from '@/lib/stripe/client';

type CreatePortalParams = {
  stripeCustomerId: string;
  stripeProductId: string;
};

export async function createCustomerPortalSession(
  params: CreatePortalParams,
  deps = { stripe: defaultStripe }
) {
  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await deps.stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await deps.stripe.products.retrieve(params.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    const prices = await deps.stripe.prices.list({
      product: product.id,
      active: true
    });

    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await deps.stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price: Stripe.Price) => price.id)
            }
          ]
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other'
            ]
          }
        },
        payment_method_update: {
          enabled: true
        }
      }
    });
  }

  const session = await deps.stripe.billingPortal.sessions.create({
    customer: params.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id
  });

  return session.url;
}
