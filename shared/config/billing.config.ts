import "server-only";

export const capabilities = [
  "task.create",
  "task.export",
  "team.invite",
  "team.analytics",
  "billing.portal",
  "ai.assistant",
  "email.sync",
  "invoice.create",
] as const;

export const limitKeys = [
  "tasksPerMonth",
  "teamMembers",
  "storageMb",
  "emailSyncsPerMonth",
] as const;

export type Capability = (typeof capabilities)[number];
export type LimitKey = (typeof limitKeys)[number];
export type PricingModel = "flat" | "per_seat";
export type BillingInterval = "month" | "year";
export type BillingLineItemKind = "flat" | "seat";
export type CreditChargeStrategy =
  | { type: "flat_per_action"; credits: number; reserveCredits?: number }
  | {
      type: "provider_cost_markup";
      markupMultiplier: number;
      usdPerCredit: number;
      reserveCredits: number;
      modelPricing: Partial<
        Record<string, { inputUsdPerMillion: number; outputUsdPerMillion: number }>
      >;
    };

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
  includedMonthlyCredits: number;
  schedules: Partial<Record<BillingInterval, BillingPlanSchedule>>;
};

export type BillingAddonDefinition = {
  id: string;
  name: string;
  description: string;
  features: string[];
  capabilityDeltas: Capability[];
  limitDeltas: Partial<Record<LimitKey, number>>;
  includedMonthlyCredits?: number;
  prices: Partial<Record<BillingInterval, BillingPrice>>;
};

export type OneTimeProductDefinition = {
  id: string;
  name: string;
  description: string;
  features: string[];
  capabilityDeltas: Capability[];
  limitDeltas: Partial<Record<LimitKey, number>>;
  price?: BillingPrice;
};

export type CreditPackDefinition = {
  id: string;
  name: string;
  description: string;
  creditsGranted: number;
  price?: BillingPrice;
};

export type BillingCatalog = {
  currency: "USD";
  plans: readonly BillingPlanDefinition[];
  addons: readonly BillingAddonDefinition[];
  oneTimeProducts: readonly OneTimeProductDefinition[];
  creditPacks: readonly CreditPackDefinition[];
  ai: {
    assistantRequest: CreditChargeStrategy;
  };
};

export type OrganizationEntitlements = {
  activeAddonIds: string[];
  billingInterval: BillingInterval | null;
  capabilities: Capability[];
  creditBalance: number;
  creditBalancePurchased: number;
  creditBalanceSubscription: number;
  includedMonthlyCredits: number;
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
      limits: { tasksPerMonth: 10, teamMembers: 1, storageMb: 100, emailSyncsPerMonth: 0 },
      includedMonthlyCredits: 0,
      schedules: {},
    },
    {
      id: "pro",
      name: "Pro",
      description: "For solo builders and small teams shipping quickly.",
      highlighted: true,
      pricingModel: "flat",
      features: ["Task export", "AI assistant access", "Email sync", "1,000 credits included"],
      capabilities: ["task.create", "task.export", "team.invite", "billing.portal", "ai.assistant", "email.sync", "invoice.create"],
      limits: { tasksPerMonth: 1000, teamMembers: 5, storageMb: 5000, emailSyncsPerMonth: 50 },
      includedMonthlyCredits: 1000,
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
      features: ["Per-seat billing", "Team analytics", "Higher usage limits", "5,000 credits included"],
      capabilities: ["task.create", "task.export", "team.invite", "team.analytics", "billing.portal", "ai.assistant", "email.sync", "invoice.create"],
      limits: { tasksPerMonth: 10000, teamMembers: 50, storageMb: 50000, emailSyncsPerMonth: 200 },
      includedMonthlyCredits: 5000,
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
  addons: [
    {
      id: "analytics",
      name: "Analytics Add-on",
      description: "Unlock team analytics on lower plans.",
      features: ["Team analytics dashboard"],
      capabilityDeltas: ["team.analytics"],
      limitDeltas: {},
      prices: {
        month: recurringPrice(process.env.STRIPE_PRICE_ANALYTICS_ADDON_MONTHLY, 1500),
        year: recurringPrice(process.env.STRIPE_PRICE_ANALYTICS_ADDON_YEARLY, 15000),
      },
    },
    {
      id: "ai_boost",
      name: "AI Boost",
      description: "Add 3,000 monthly credits to the active subscription.",
      features: ["Extra monthly AI credits"],
      capabilityDeltas: [],
      limitDeltas: {},
      includedMonthlyCredits: 3000,
      prices: {
        month: recurringPrice(process.env.STRIPE_PRICE_AI_BOOST_ADDON_MONTHLY, 2000),
        year: recurringPrice(process.env.STRIPE_PRICE_AI_BOOST_ADDON_YEARLY, 20000),
      },
    },
  ],
  oneTimeProducts: [
    {
      id: "storage_boost",
      name: "Storage Boost",
      description: "Add 10 GB of storage to this workspace.",
      features: ["10 GB extra storage"],
      capabilityDeltas: [],
      limitDeltas: { storageMb: 10_000 },
      price: usdPrice(process.env.STRIPE_PRICE_STORAGE_BOOST, 7900),
    },
  ],
  creditPacks: [
    {
      id: "credits_2000",
      name: "2,000 credits",
      description: "One-time credit top-up for AI usage.",
      creditsGranted: 2000,
      price: usdPrice(process.env.STRIPE_PRICE_CREDIT_PACK_2000, 2000),
    },
    {
      id: "credits_10000",
      name: "10,000 credits",
      description: "Large one-time credit top-up for AI usage.",
      creditsGranted: 10000,
      price: usdPrice(process.env.STRIPE_PRICE_CREDIT_PACK_10000, 9000),
    },
  ],
  ai: {
    assistantRequest: {
      type: "flat_per_action",
      credits: Number(process.env.AI_CREDITS_PER_ASSISTANT_REQUEST ?? "25"),
      reserveCredits: Number(process.env.AI_CREDIT_RESERVE_PER_REQUEST ?? "25"),
    },
  },
} as const satisfies BillingCatalog;

export type BillingPlan = BillingPlanDefinition;
export type PlanId = (typeof billingConfig.plans)[number]["id"];
export type PaidPlanId = Exclude<PlanId, "free">;
