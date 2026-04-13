import type { PlanId } from "@/shared/config/billing.config";
import { stripe } from "@/shared/lib/stripe/client";

type SeedStripePlan = {
  name: string;
  description: string;
  unitAmount: number;
  planId: Exclude<PlanId, "free">;
};

const FREE_TRIAL_DAYS = 7;

const STRIPE_PLANS: SeedStripePlan[] = [
  {
    name: "Base",
    description: "Base subscription plan",
    unitAmount: 800,
    planId: "pro",
  },
  {
    name: "Plus",
    description: "Plus subscription plan",
    unitAmount: 1200,
    planId: "team",
  },
];

function normalizeStripeName(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

async function ensureStripeProduct(plan: SeedStripePlan) {
  const products = await stripe.products.list({
    active: true,
    limit: 100,
  });

  const existingProduct =
    products.data.find((product) => product.metadata.plan_id === plan.planId) ??
    products.data.find(
      (product) =>
        normalizeStripeName(product.name) === normalizeStripeName(plan.name),
    );

  if (existingProduct) {
    return stripe.products.update(existingProduct.id, {
      name: plan.name,
      description: plan.description,
      metadata: {
        ...existingProduct.metadata,
        plan_id: plan.planId,
      },
    });
  }

  return stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: {
      plan_id: plan.planId,
    },
  });
}

async function ensureMonthlyPrice(productId: string, plan: SeedStripePlan) {
  const prices = await stripe.prices.list({
    active: true,
    product: productId,
    limit: 100,
  });

  const existingPrice = prices.data.find(
    (price) =>
      price.type === "recurring" &&
      price.currency === "usd" &&
      price.unit_amount === plan.unitAmount &&
      price.recurring?.interval === "month" &&
      price.recurring.trial_period_days === FREE_TRIAL_DAYS,
  );

  if (existingPrice) {
    return existingPrice;
  }

  return stripe.prices.create({
    product: productId,
    unit_amount: plan.unitAmount,
    currency: "usd",
    recurring: {
      interval: "month",
      trial_period_days: FREE_TRIAL_DAYS,
    },
  });
}

export async function seedStripeProducts() {
  console.log("Creating Stripe products and prices...");

  for (const plan of STRIPE_PLANS) {
    const product = await ensureStripeProduct(plan);
    await ensureMonthlyPrice(product.id, plan);
  }

  console.log("Stripe products and prices created successfully.");
}
