// HOW TO EDIT YOUR PLANS
// 1. Create products and prices in your Stripe dashboard.
// 2. Copy each price ID into the matching STRIPE_PRICE_* variable in .env.
// 3. Edit the `plans` array below: change names, features, capabilities, and limits.
// 4. Capabilities control feature access (e.g. "ai.assistant"). Limits control quotas (e.g. tasksPerMonth).

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
export type BillingInterval = "month" | "year";

export type BillingPrice = {
  priceId: string;
  unitAmount: number;
  currency: "usd";
  trialDays?: number;
};

export type BillingRecurringLineItem = {
  component: string;
  price: BillingPrice;
};

export type BillingIntervalPricing = {
  lineItems: readonly BillingRecurringLineItem[];
};

export type BillingPlan = {
  id: string;
  name: string;
  description: string;
  highlighted?: boolean;
  features: string[];
  capabilities: Capability[];
  limits: Record<LimitKey, number>;
  intervalPricing: Partial<Record<BillingInterval, BillingIntervalPricing>>;
};

export type BillingCatalog = {
  currency: "USD";
  plans: readonly BillingPlan[];
};

export type OrganizationEntitlements = {
  billingInterval: BillingInterval | null;
  capabilities: Capability[];
  limits: Record<LimitKey, number>;
  organizationId: string;
  planId: PlanId;
  planName: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  trialEnd: Date | null;
};

export const billingConfig = {
  currency: "USD",
  plans: [
    {
      id: "free",
      name: "Free",
      description: "For trying the starter without paid billing.",
      features: ["Create tasks", "Billing portal access"],
      capabilities: ["task.create", "billing.portal"],
      limits: { tasksPerMonth: 10, teamMembers: 1, storageMb: 100, aiCredits: 0 },
      intervalPricing: {},
    },
    {
      id: "pro",
      name: "Pro",
      description: "For solo builders and small teams shipping quickly.",
      highlighted: true,
      features: ["Task export", "AI assistant access", "Higher usage limits"],
      capabilities: [
        "task.create",
        "task.export",
        "team.invite",
        "billing.portal",
        "ai.assistant",
      ],
      limits: { tasksPerMonth: 1000, teamMembers: 5, storageMb: 5000, aiCredits: 1000 },
      intervalPricing: {
        month: process.env.STRIPE_PRICE_PRO_MONTHLY
          ? {
              lineItems: [
                {
                  component: "base",
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
                  component: "base",
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
      description: "For growing teams that need analytics and higher limits.",
      features: [
        "Everything in Pro",
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
      intervalPricing: {
        month: process.env.STRIPE_PRICE_TEAM_MONTHLY
          ? {
              lineItems: [
                {
                  component: "base",
                  price: {
                    priceId: process.env.STRIPE_PRICE_TEAM_MONTHLY!,
                    unitAmount: 4900,
                    currency: "usd",
                    trialDays: 7,
                  },
                },
              ],
            }
          : undefined,
        year: process.env.STRIPE_PRICE_TEAM_YEARLY
          ? {
              lineItems: [
                {
                  component: "base",
                  price: {
                    priceId: process.env.STRIPE_PRICE_TEAM_YEARLY!,
                    unitAmount: 49000,
                    currency: "usd",
                    trialDays: 7,
                  },
                },
              ],
            }
          : undefined,
      },
    },
  ],
} as const satisfies BillingCatalog;

export type PlanId = (typeof billingConfig.plans)[number]["id"];
export type PaidPlanId = Exclude<PlanId, "free">;

function parseBooleanEnv(name: string, defaultValue = false) {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return defaultValue;
}

const automaticTaxEnabled = parseBooleanEnv("ENABLE_AUTOMATIC_TAX_CALCULATION");
const taxIdCollectionEnabled = parseBooleanEnv("ENABLE_TAX_ID_COLLECTION");

export const checkoutSettings = {
  automaticTax: automaticTaxEnabled,
  taxIdCollection: taxIdCollectionEnabled,
  billingAddressRequired: parseBooleanEnv(
    "STRIPE_REQUIRE_BILLING_ADDRESS",
    automaticTaxEnabled || taxIdCollectionEnabled,
  ),
  trialWithoutCard: parseBooleanEnv("STRIPE_ENABLE_TRIAL_WITHOUT_CC"),
} as const;
