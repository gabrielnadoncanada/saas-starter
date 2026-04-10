import "server-only";

// HOW TO EDIT YOUR PLANS
// 1. Create products and prices in your Stripe dashboard.
// 2. Copy each price ID into the matching STRIPE_PRICE_* variable in .env.
// 3. Edit the `plans` array below: change names, features, capabilities, and limits.
// 4. Capabilities control feature access (e.g. "ai.assistant"). Limits control quotas (e.g. tasksPerMonth).
// 5. One-time products (like storage boosts) go in the `oneTimeProducts` array.

export const capabilities = [
  "task.create",
  "task.export",
  "team.invite",
  "team.analytics",
  "billing.portal",
  "ai.assistant",
] as const;

export const limitKeys = ["tasksPerMonth", "teamMembers", "storageMb", "aiCredits"] as const;

export type Capability = (typeof capabilities)[number];
export type LimitKey = (typeof limitKeys)[number];
export type PricingModel = "flat" | "per_seat";
export type BillingInterval = "month" | "year";
export type BillingLineItemKind = "flat" | "seat";

export type BillingPrice = {
  priceId: string;
  unitAmount: number;
  currency: "usd";
  trialDays?: number;
};

export type BillingRecurringLineItem = {
  id: string;
  kind: BillingLineItemKind;
  price: BillingPrice;
  includedQuantity?: number;
  unitLabel?: string;
};

export type BillingPlanSchedule = {
  lineItems: readonly BillingRecurringLineItem[];
};

export type BillingPlanDefinition = {
  id: string;
  name: string;
  description: string;
  highlighted?: boolean;
  pricingModel: PricingModel;
  features: string[];
  capabilities: Capability[];
  limits: Record<LimitKey, number>;
  schedules: Partial<Record<BillingInterval, BillingPlanSchedule>>;
};

export type OneTimeProductDefinition = {
  id: string;
  name: string;
  description: string;
  features: string[];
  price?: BillingPrice;
  limitEffect?: Partial<Record<LimitKey, number>>;
};

export type BillingCatalog = {
  currency: "USD";
  plans: readonly BillingPlanDefinition[];
  oneTimeProducts: readonly OneTimeProductDefinition[];
};

export type OrganizationEntitlements = {
  billingInterval: BillingInterval | null;
  capabilities: Capability[];
  limits: Record<LimitKey, number>;
  oneTimeProductIds: string[];
  organizationId: string;
  planId: PlanId;
  planName: string;
  pricingModel: PricingModel;
  seats: number | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
};

export const billingConfig = {
  currency: "USD",
  plans: [
    {
      id: "free",
      name: "Free",
      description: "For trying the starter without paid billing.",
      pricingModel: "flat",
      features: ["Create tasks", "Billing portal access"],
      capabilities: ["task.create", "billing.portal"],
      limits: { tasksPerMonth: 10, teamMembers: 1, storageMb: 100, aiCredits: 0 },
      schedules: {},
    },
    {
      id: "pro",
      name: "Pro",
      description: "For solo builders and small teams shipping quickly.",
      highlighted: true,
      pricingModel: "flat",
      features: ["Task export", "AI assistant access", "Higher usage limits"],
      capabilities: [
        "task.create",
        "task.export",
        "team.invite",
        "billing.portal",
        "ai.assistant",
      ],
      limits: { tasksPerMonth: 1000, teamMembers: 5, storageMb: 5000, aiCredits: 1000 },
      schedules: {
        month: process.env.STRIPE_PRICE_PRO_MONTHLY
          ? {
              lineItems: [
                {
                  id: "base",
                  kind: "flat",
                  price: {
                    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
                    unitAmount: 1900,
                    currency: "usd",
                    trialDays: 7,
                  },
                },
              ],
            }
          : undefined,
        year: process.env.STRIPE_PRICE_PRO_YEARLY
          ? {
              lineItems: [
                {
                  id: "base",
                  kind: "flat",
                  price: {
                    priceId: process.env.STRIPE_PRICE_PRO_YEARLY!,
                    unitAmount: 19000,
                    currency: "usd",
                    trialDays: 7,
                  },
                },
              ],
            }
          : undefined,
      },
    },
    {
      id: "team",
      name: "Team",
      description: "For teams that need seats, analytics, and higher limits.",
      pricingModel: "per_seat",
      features: [
        "Per-seat billing",
        "Team analytics",
        "Higher usage limits",
        "AI assistant",
      ],
      capabilities: [
        "task.create",
        "task.export",
        "team.invite",
        "team.analytics",
        "billing.portal",
        "ai.assistant",
      ],
      limits: { tasksPerMonth: 10000, teamMembers: 50, storageMb: 50000, aiCredits: 10000 },
      schedules: {
        month: process.env.STRIPE_PRICE_TEAM_MONTHLY
          ? {
              lineItems: [
                {
                  id: "seat",
                  kind: "seat",
                  price: {
                    priceId: process.env.STRIPE_PRICE_TEAM_MONTHLY!,
                    unitAmount: 4900,
                    currency: "usd",
                    trialDays: 7,
                  },
                  unitLabel: "seat",
                },
              ],
            }
          : undefined,
        year: process.env.STRIPE_PRICE_TEAM_YEARLY
          ? {
              lineItems: [
                {
                  id: "seat",
                  kind: "seat",
                  price: {
                    priceId: process.env.STRIPE_PRICE_TEAM_YEARLY!,
                    unitAmount: 49000,
                    currency: "usd",
                    trialDays: 7,
                  },
                  unitLabel: "seat",
                },
              ],
            }
          : undefined,
      },
    },
  ],
  oneTimeProducts: [
    {
      id: "storage_boost",
      name: "Storage Boost",
      description: "Add 10 GB of storage to this workspace.",
      features: ["10 GB extra storage"],
      price: process.env.STRIPE_PRICE_STORAGE_BOOST
        ? {
            priceId: process.env.STRIPE_PRICE_STORAGE_BOOST,
            unitAmount: 7900,
            currency: "usd",
          }
        : undefined,
      limitEffect: { storageMb: 10_000 },
    },
  ],
} as const satisfies BillingCatalog;

export type BillingPlan = BillingPlanDefinition;
export type PlanId = (typeof billingConfig.plans)[number]["id"];
export type PaidPlanId = Exclude<PlanId, "free">;
