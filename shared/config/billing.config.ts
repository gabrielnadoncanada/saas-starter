import "server-only";

export const capabilities = [
  "task.create",
  "task.export",
  "team.invite",
  "team.analytics",
  "billing.portal",
  "api.access",
  "ai.assistant",
  "email.sync",
  "invoice.create",
] as const;

export const limitKeys = [
  "tasksPerMonth",
  "teamMembers",
  "storageMb",
  "aiRequestsPerMonth",
  "emailSyncsPerMonth",
] as const;

export type Capability = (typeof capabilities)[number];
export type LimitKey = (typeof limitKeys)[number];
export type PricingModel = "flat" | "per_seat";
export type BillingInterval = "month" | "year";

export type BillingPrice = {
  priceId: string;
  unitAmount: number;
  trialDays?: number;
};

type BillingPlanPrices = {
  month?: BillingPrice;
  year?: BillingPrice;
};

type BillingPlanDefinition = {
  id: string;
  name: string;
  description: string;
  highlighted?: boolean;
  pricingModel: PricingModel;
  features: string[];
  capabilities: Capability[];
  limits: Record<LimitKey, number>;
  prices: BillingPlanPrices;
};

export type BillingConfig = {
  currency: "USD";
  plans: readonly BillingPlanDefinition[];
};

function defineBillingPlan<const TPlanId extends string>(
  plan: BillingPlanDefinition & { id: TPlanId },
) {
  return plan;
}

export const billingConfig = {
  currency: "USD",
  plans: [
    defineBillingPlan({
      id: "free",
      name: "Free",
      description: "For trying the starter without paid billing.",
      pricingModel: "flat",
      features: ["Create tasks", "Billing portal access"],
      capabilities: ["task.create", "billing.portal"],
      limits: {
        tasksPerMonth: 10,
        teamMembers: 1,
        storageMb: 100,
        aiRequestsPerMonth: 0,
        emailSyncsPerMonth: 0,
      },
      prices: {},
    }),
    defineBillingPlan({
      id: "pro",
      name: "Pro",
      description: "For solo builders and small teams shipping quickly.",
      highlighted: true,
      pricingModel: "flat",
      features: [
        "Task export",
        "AI assistant access",
        "Email sync",
        "Up to 5 team members",
      ],
      capabilities: [
        "task.create",
        "task.export",
        "team.invite",
        "billing.portal",
        "api.access",
        "ai.assistant",
        "email.sync",
        "invoice.create",
      ],
      limits: {
        tasksPerMonth: 1000,
        teamMembers: 5,
        storageMb: 5000,
        aiRequestsPerMonth: 100,
        emailSyncsPerMonth: 50,
      },
      prices: {
        ...(process.env.STRIPE_PRICE_PRO_MONTHLY
          ? {
              month: {
                priceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
                unitAmount: 1900,
                trialDays: 7,
              },
            }
          : {}),
        ...(process.env.STRIPE_PRICE_PRO_YEARLY
          ? {
              year: {
                priceId: process.env.STRIPE_PRICE_PRO_YEARLY,
                unitAmount: 19000,
                trialDays: 7,
              },
            }
          : {}),
      },
    }),
    defineBillingPlan({
      id: "team",
      name: "Team",
      description: "For teams that need seats, analytics, and higher limits.",
      pricingModel: "per_seat",
      features: [
        "Per-seat billing",
        "Team analytics",
        "Higher usage limits",
        "Up to 50 team members",
      ],
      capabilities: [
        "task.create",
        "task.export",
        "team.invite",
        "team.analytics",
        "billing.portal",
        "api.access",
        "ai.assistant",
        "email.sync",
        "invoice.create",
      ],
      limits: {
        tasksPerMonth: 10000,
        teamMembers: 50,
        storageMb: 50000,
        aiRequestsPerMonth: 500,
        emailSyncsPerMonth: 200,
      },
      prices: {
        ...(process.env.STRIPE_PRICE_TEAM_MONTHLY
          ? {
              month: {
                priceId: process.env.STRIPE_PRICE_TEAM_MONTHLY,
                unitAmount: 4900,
                trialDays: 7,
              },
            }
          : {}),
        ...(process.env.STRIPE_PRICE_TEAM_YEARLY
          ? {
              year: {
                priceId: process.env.STRIPE_PRICE_TEAM_YEARLY,
                unitAmount: 49000,
                trialDays: 7,
              },
            }
          : {}),
      },
    }),
  ],
} as const satisfies BillingConfig;

export type BillingPlan = (typeof billingConfig.plans)[number];
export type PlanId = BillingPlan["id"];
export type PaidPlanId = Exclude<PlanId, "free">;

const plansById = Object.fromEntries(
  billingConfig.plans.map((plan) => [plan.id, plan]),
) as Record<PlanId, BillingPlan>;

export function getPlan(planId: PlanId): BillingPlan {
  return plansById[planId] ?? plansById.free;
}

export function isPlanId(value: string): value is PlanId {
  return Object.hasOwn(plansById, value);
}

export function isBillingInterval(value: string): value is BillingInterval {
  return value === "month" || value === "year";
}

export function getPlanPrice(
  planId: PlanId,
  billingInterval: BillingInterval,
): BillingPrice | null {
  return getPlan(planId).prices[billingInterval] ?? null;
}

export function getPricingPlans() {
  return billingConfig.plans.filter(
    (plan) =>
      plan.id !== "free" &&
      (Boolean(plan.prices.month) || Boolean(plan.prices.year)),
  );
}

export function findPlanPriceByPriceId(priceId: string) {
  for (const plan of billingConfig.plans) {
    if (plan.prices.month?.priceId === priceId) {
      return {
        billingInterval: "month" as const,
        plan,
        price: plan.prices.month,
      };
    }

    if (plan.prices.year?.priceId === priceId) {
      return {
        billingInterval: "year" as const,
        plan,
        price: plan.prices.year,
      };
    }
  }

  return null;
}
