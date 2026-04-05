import "server-only";

export const capabilities = [
  "task.create",
  "task.export",
  "team.invite",
  "team.analytics",
  "billing.portal",
  "ai.assistant",
] as const;

export const limitKeys = [
  "tasksPerMonth",
  "teamMembers",
  "storageMb",
] as const;

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

function usdPrice(priceId: string | undefined, unitAmount: number) {
  return priceId ? { priceId, unitAmount, currency: "usd" as const } : undefined;
}

function recurringPrice(priceId: string | undefined, unitAmount: number, trialDays?: number) {
  return priceId
    ? { priceId, unitAmount, currency: "usd" as const, trialDays }
    : undefined;
}

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
      limits: { tasksPerMonth: 10, teamMembers: 1, storageMb: 100 },
      schedules: {},
    },
    {
      id: "pro",
      name: "Pro",
      description: "For solo builders and small teams shipping quickly.",
      highlighted: true,
      pricingModel: "flat",
      features: ["Task export", "AI assistant access", "Higher usage limits"],
      capabilities: ["task.create", "task.export", "team.invite", "billing.portal", "ai.assistant"],
      limits: { tasksPerMonth: 1000, teamMembers: 5, storageMb: 5000 },
      schedules: {
        month: process.env.STRIPE_PRICE_PRO_MONTHLY
          ? { lineItems: [{ id: "base", kind: "flat", price: recurringPrice(process.env.STRIPE_PRICE_PRO_MONTHLY, 1900, 7)! }] }
          : undefined,
        year: process.env.STRIPE_PRICE_PRO_YEARLY
          ? { lineItems: [{ id: "base", kind: "flat", price: recurringPrice(process.env.STRIPE_PRICE_PRO_YEARLY, 19000, 7)! }] }
          : undefined,
      },
    },
    {
      id: "team",
      name: "Team",
      description: "For teams that need seats, analytics, and higher limits.",
      pricingModel: "per_seat",
      features: ["Per-seat billing", "Team analytics", "Higher usage limits", "AI assistant"],
      capabilities: ["task.create", "task.export", "team.invite", "team.analytics", "billing.portal", "ai.assistant"],
      limits: { tasksPerMonth: 10000, teamMembers: 50, storageMb: 50000 },
      schedules: {
        month: process.env.STRIPE_PRICE_TEAM_MONTHLY
          ? { lineItems: [{ id: "seat", kind: "seat", price: recurringPrice(process.env.STRIPE_PRICE_TEAM_MONTHLY, 4900, 7)!, unitLabel: "seat" }] }
          : undefined,
        year: process.env.STRIPE_PRICE_TEAM_YEARLY
          ? { lineItems: [{ id: "seat", kind: "seat", price: recurringPrice(process.env.STRIPE_PRICE_TEAM_YEARLY, 49000, 7)!, unitLabel: "seat" }] }
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
      price: usdPrice(process.env.STRIPE_PRICE_STORAGE_BOOST, 7900),
    },
  ],
} as const satisfies BillingCatalog;

export type BillingPlan = BillingPlanDefinition;
export type PlanId = (typeof billingConfig.plans)[number]["id"];
export type PaidPlanId = Exclude<PlanId, "free">;
