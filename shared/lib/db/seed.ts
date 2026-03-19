import { db } from "./prisma";
import { stripe } from "@/shared/lib/stripe/client";

type SeedStripePlan = {
  name: string;
  description: string;
  unitAmount: number;
  planId: "pro" | "team";
  pricingModel: "flat";
};

const FREE_TRIAL_DAYS = 7;

const STRIPE_PLANS: SeedStripePlan[] = [
  {
    name: "Base",
    description: "Base subscription plan",
    unitAmount: 800,
    planId: "pro",
    pricingModel: "flat",
  },
  {
    name: "Plus",
    description: "Plus subscription plan",
    unitAmount: 1200,
    planId: "team",
    pricingModel: "flat",
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
        pricing_model: plan.pricingModel,
      },
    });
  }

  return stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: {
      plan_id: plan.planId,
      pricing_model: plan.pricingModel,
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

async function createStripeProducts() {
  console.log("Creating Stripe products and prices...");

  for (const plan of STRIPE_PLANS) {
    const product = await ensureStripeProduct(plan);
    await ensureMonthlyPrice(product.id, plan);
  }

  console.log("Stripe products and prices created successfully.");
}

async function seed() {
  const email = "test@test.com";

  await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
    },
  });

  console.log("Initial user ready.");

  let team = await db.team.findFirst({
    where: { name: "Test Team" },
  });

  if (!team) {
    team = await db.team.create({
      data: {
        name: "Test Team",
      },
    });
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Seed user not found");
  }

  const existingTeamMember = await db.teamMember.findFirst({
    where: {
      teamId: team.id,
      userId: user.id,
    },
  });

  if (!existingTeamMember) {
    await db.teamMember.create({
      data: {
        teamId: team.id,
        userId: user.id,
        role: "OWNER",
      },
    });
  }

  await createStripeProducts();
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
