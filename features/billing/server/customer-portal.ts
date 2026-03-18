import Stripe from "stripe";

import type { PricingModel } from "@/features/billing/plans";
import { routes } from "@/shared/constants/routes";
import { stripe as defaultStripe } from "@/shared/lib/stripe/client";

const PORTAL_CONFIG_KEY = "saas_starter_portal";

type CreatePortalParams = {
  stripeCustomerId: string;
  pricingModel: PricingModel | null;
  stripeProductId: string;
  stripeSubscriptionId: string | null;
};

function buildPortalConfigKey(params: CreatePortalParams) {
  if (!params.stripeSubscriptionId) {
    return "one_time";
  }

  return `${params.pricingModel ?? "flat"}:${params.stripeProductId}`;
}

async function upsertPortalConfiguration(
  params: CreatePortalParams,
  deps: { stripe: typeof defaultStripe },
) {
  const configKey = buildPortalConfigKey(params);
  const configurations = await deps.stripe.billingPortal.configurations.list();
  const existingConfiguration = configurations.data.find(
    (configuration) => configuration.metadata?.[PORTAL_CONFIG_KEY] === configKey,
  );

  if (!params.stripeSubscriptionId) {
    const oneTimeConfig: Stripe.BillingPortal.ConfigurationCreateParams = {
      business_profile: {
        headline: "Your billing history",
      },
      features: {
        payment_method_update: {
          enabled: true,
        },
      },
      metadata: {
        [PORTAL_CONFIG_KEY]: configKey,
      },
    };

    if (existingConfiguration) {
      return deps.stripe.billingPortal.configurations.update(
        existingConfiguration.id,
        oneTimeConfig,
      );
    }

    return deps.stripe.billingPortal.configurations.create(oneTimeConfig);
  }

  const product = await deps.stripe.products.retrieve(params.stripeProductId);
  if (!product.active) {
    throw new Error("Team's product is not active in Stripe");
  }

  const prices = await deps.stripe.prices.list({
    product: product.id,
    active: true,
  });

  if (prices.data.length === 0) {
    throw new Error("No active prices found for the team's product");
  }

  const allowedUpdates: Stripe.BillingPortal.ConfigurationCreateParams.Features.SubscriptionUpdate.DefaultAllowedUpdate[] =
    params.pricingModel === "per_seat"
      ? ["price", "quantity", "promotion_code"]
      : ["price", "promotion_code"];

  const subscriptionConfig: Stripe.BillingPortal.ConfigurationCreateParams = {
    business_profile: {
      headline: "Manage your subscription",
    },
    features: {
      subscription_update: {
        enabled: true,
        default_allowed_updates: allowedUpdates,
        proration_behavior: "create_prorations",
        products: [
          {
            product: product.id,
            prices: prices.data.map((price) => price.id),
          },
        ],
      },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        cancellation_reason: {
          enabled: true,
          options: [
            "too_expensive",
            "missing_features",
            "switched_service",
            "unused",
            "other",
          ],
        },
      },
      payment_method_update: {
        enabled: true,
      },
    },
    metadata: {
      [PORTAL_CONFIG_KEY]: configKey,
    },
  };

  if (existingConfiguration) {
    return deps.stripe.billingPortal.configurations.update(
      existingConfiguration.id,
      subscriptionConfig,
    );
  }

  return deps.stripe.billingPortal.configurations.create(subscriptionConfig);
}

export async function createCustomerPortalSession(
  params: CreatePortalParams,
  deps = { stripe: defaultStripe },
) {
  const configuration = await upsertPortalConfiguration(params, deps);

  const session = await deps.stripe.billingPortal.sessions.create({
    customer: params.stripeCustomerId,
    return_url: `${process.env.BASE_URL}${routes.app.dashboard}`,
    configuration: configuration.id,
  });

  return session.url;
}
