import { stripe as defaultStripe } from "@/shared/lib/stripe/client";

export async function getStripePrices(deps = { stripe: defaultStripe }) {
  const prices = await deps.stripe.prices.list({
    expand: ["data.product"],
    active: true,
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    type: price.type,
    interval: price.recurring?.interval ?? null,
    trialPeriodDays: price.recurring?.trial_period_days ?? null,
  }));
}

export async function getStripeProducts(deps = { stripe: defaultStripe }) {
  const products = await deps.stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    metadata: product.metadata,
    defaultPriceId:
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id,
  }));
}
