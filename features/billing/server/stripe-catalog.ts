import { unstable_cache } from "next/cache";

import { stripe as defaultStripe } from "@/shared/lib/stripe/client";

async function listStripePrices(stripe = defaultStripe) {
  const prices = await stripe.prices.list({
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

async function listStripeProducts(stripe = defaultStripe) {
  const products = await stripe.products.list({
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

const getCachedStripePrices = unstable_cache(
  () => listStripePrices(),
  ["stripe-prices"],
  { revalidate: 300 },
);

const getCachedStripeProducts = unstable_cache(
  () => listStripeProducts(),
  ["stripe-products"],
  { revalidate: 300 },
);

export async function getStripePrices(deps = { stripe: defaultStripe }) {
  if (deps.stripe === defaultStripe) {
    return getCachedStripePrices();
  }

  return listStripePrices(deps.stripe);
}

export async function getStripeProducts(deps = { stripe: defaultStripe }) {
  if (deps.stripe === defaultStripe) {
    return getCachedStripeProducts();
  }

  return listStripeProducts(deps.stripe);
}
