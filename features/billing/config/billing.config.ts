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

export type Capability = (typeof capabilities)[number];

export const limitKeys = [
  "tasksPerMonth",
  "teamMembers",
  "storageMb",
  "aiRequestsPerMonth",
  "emailSyncsPerMonth",
] as const;

export type LimitKey = (typeof limitKeys)[number];

export type PlanId = "free" | "pro" | "team";
export type PricingModel = "flat" | "per_seat" | "one_time";
export type BillingInterval = "month" | "year" | "one_time";

export type BillingPrice = {
  priceId: string;
  unitAmount: number;
  trialDays?: number;
};

export type BillingPrices = {
  monthly?: BillingPrice;
  yearly?: BillingPrice;
  oneTime?: BillingPrice;
};

export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  marketingFeatures: string[];
  capabilities: Capability[];
  limits: Record<LimitKey, number>;
  pricingModel: PricingModel;
  prices: BillingPrices;
};

export const plans: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    description: "For trying the starter without paid billing.",
    marketingFeatures: [
      "Create tasks",
      "Billing portal access",
    ],
    capabilities: ["task.create", "billing.portal"],
    limits: {
      tasksPerMonth: 10,
      teamMembers: 1,
      storageMb: 100,
      aiRequestsPerMonth: 0,
      emailSyncsPerMonth: 0,
    },
    pricingModel: "flat",
    prices: {},
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For solo builders and small teams shipping quickly.",
    marketingFeatures: [
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
    pricingModel: "flat",
    prices: {
      monthly: {
        priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
        unitAmount: 1900,
        trialDays: 7,
      },
      yearly: {
        priceId: process.env.STRIPE_PRICE_PRO_YEARLY!,
        unitAmount: 19000,
        trialDays: 7,
      },
      oneTime: {
        priceId: process.env.STRIPE_PRICE_PRO_LIFETIME!,
        unitAmount: 29900,
      },
    },
  },
  team: {
    id: "team",
    name: "Team",
    description: "For teams that need seats, analytics, and higher limits.",
    marketingFeatures: [
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
    pricingModel: "per_seat",
    prices: {
      monthly: {
        priceId: process.env.STRIPE_PRICE_TEAM_MONTHLY!,
        unitAmount: 4900,
        trialDays: 7,
      },
      yearly: {
        priceId: process.env.STRIPE_PRICE_TEAM_YEARLY!,
        unitAmount: 49000,
        trialDays: 7,
      },
    },
  },
};

export function getPlan(planId: PlanId): Plan {
  return plans[planId] ?? plans.free;
}

export function isPlanId(value: string): value is PlanId {
  return value in plans;
}
