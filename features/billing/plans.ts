// Billing plans: catalog lookups, checkout helpers, and entitlement guards from billing.config.ts.
//
// HOW TO ADD A NEW PLAN:
//   1. Create a product + prices in Stripe Dashboard (monthly and/or yearly).
//   2. Add STRIPE_PRICE_<NAME>_MONTHLY / STRIPE_PRICE_<NAME>_YEARLY to .env.
//   3. Add a new entry in the `plans` array in shared/config/billing.config.ts.
//      Copy the "pro" block and change: id, name, description, features, capabilities, limits, price env vars.
//   4. Done — the pricing page, checkout, and entitlements will pick it up automatically.
//
// Main entry points:
//   getPricingPlans()              → plans with at least one configured price
//   buildPlanCheckoutLineItems()   → Stripe-ready line items for checkout
//   parseSubscriptionForm()        → validate + extract plan selection from FormData
//   getDefaultEntitlements()       → free-plan entitlements for new orgs
//   hasCapability / assertCapability / checkLimit / assertLimit → plan guards

import {
  billingConfig,
  type BillingInterval,
  type BillingPlan,
  type BillingPlanDefinition,
  type BillingPlanSchedule,
  type BillingPrice,
  type Capability,
  type LimitKey,
  type OneTimeProductDefinition,
  type OrganizationEntitlements,
  type PlanId,
} from "@/shared/config/billing.config";

export type RecurringCatalogPrice = {
  billingInterval: BillingInterval;
  componentKey: string;
  itemKey: string;
  itemType: "plan";
  plan?: BillingPlanDefinition;
  price: BillingPrice;
};

export function findCatalogRecurringPriceByPriceId(priceId: string) {
  for (const plan of billingConfig.plans) {
    for (const [interval, schedule] of Object.entries(plan.schedules)) {
      for (const lineItem of schedule?.lineItems ?? []) {
        if (lineItem.price.priceId === priceId) {
          return {
            billingInterval: interval as BillingInterval,
            componentKey: lineItem.id,
            itemKey: plan.id,
            itemType: "plan" as const,
            plan,
            price: lineItem.price,
          };
        }
      }
    }
  }
  return null;
}

function getPlanSchedule(
  plan: BillingPlan,
  billingInterval: BillingInterval,
): BillingPlanSchedule | undefined {
  const schedules = plan.schedules as Partial<
    Record<BillingInterval, BillingPlanSchedule | undefined>
  >;

  return schedules[billingInterval];
}

export function isPlanId(value: string): value is PlanId {
  return billingConfig.plans.some((plan) => plan.id === value);
}

export function getPlan(planId: PlanId): BillingPlan {
  return billingConfig.plans.find((p) => p.id === planId) ?? billingConfig.plans[0];
}

export function getOneTimeProduct(productId: string) {
  return billingConfig.oneTimeProducts.find((p) => p.id === productId) ?? null;
}

export function isBillingInterval(value: string): value is BillingInterval {
  return value === "month" || value === "year";
}

export function getPlanDisplayPrice(
  planId: string,
  billingInterval: BillingInterval,
) {
  if (!isPlanId(planId)) {
    return null;
  }

  return (
    getPlanSchedule(getPlan(planId), billingInterval)?.lineItems[0]?.price ??
    null
  );
}

export function getPricingPlans(): BillingPlanDefinition[] {
  return billingConfig.plans.filter((plan) =>
    ["month", "year"].some((interval) =>
      Boolean(
        getPlanSchedule(plan, interval as BillingInterval)?.lineItems[0]?.price,
      ),
    ),
  ) as BillingPlanDefinition[];
}

export function listOneTimeProducts(): OneTimeProductDefinition[] {
  return billingConfig.oneTimeProducts.filter((product) =>
    Boolean(product.price),
  ) as OneTimeProductDefinition[];
}

export function buildPlanCheckoutLineItems(params: {
  billingInterval: BillingInterval;
  planId: PlanId;
  seatQuantity: number;
}) {
  return buildRecurringSelectionItems(params).map((item) => ({
    price: item.priceId,
    quantity: item.quantity,
  }));
}

export function buildRecurringSelectionItems(params: {
  billingInterval: BillingInterval;
  planId: PlanId;
  seatQuantity: number;
}) {
  const plan = getPlan(params.planId);
  const schedule = getPlanSchedule(plan, params.billingInterval);

  if (!schedule) {
    return [];
  }

  return schedule.lineItems.map((lineItem) => ({
    componentKey: lineItem.id,
    itemKey: plan.id,
    itemType: "plan" as const,
    priceId: lineItem.price.priceId,
    quantity:
      lineItem.kind === "seat"
        ? Math.max(1, params.seatQuantity - (lineItem.includedQuantity ?? 0))
        : 1,
  }));
}

export type SubscriptionFormSelection = {
  planId: PlanId;
  billingInterval: BillingInterval;
  seatQuantity: number | null;
};

export function parseSubscriptionForm(
  formData: FormData,
): SubscriptionFormSelection {
  const rawPlanId = formData.get("planId");
  const rawBillingInterval = formData.get("billingInterval");
  const rawSeatQuantity = formData.get("seatQuantity");

  const planId = typeof rawPlanId === "string" ? rawPlanId : null;
  const billingInterval =
    typeof rawBillingInterval === "string" ? rawBillingInterval : null;
  const seatQuantity =
    typeof rawSeatQuantity === "string" ? Number(rawSeatQuantity) : NaN;

  if (
    !planId ||
    !isPlanId(planId) ||
    planId === "free" ||
    !billingInterval ||
    !isBillingInterval(billingInterval) ||
    !getPlanDisplayPrice(planId, billingInterval)
  ) {
    throw new Error("Invalid billing selection.");
  }

  return {
    planId,
    billingInterval,
    seatQuantity: Number.isFinite(seatQuantity)
      ? Math.max(1, seatQuantity)
      : null,
  };
}

export function getDefaultEntitlements(params: {
  organizationId: string;
}): OrganizationEntitlements {
  const plan = getPlan("free");

  return {
    billingInterval: null,
    capabilities: [...plan.capabilities],
    limits: { ...plan.limits },
    oneTimeProductIds: [],
    organizationId: params.organizationId,
    planId: "free",
    planName: plan.name,
    pricingModel: plan.pricingModel,
    seats: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
  };
}

export class LimitReachedError extends Error {
  public readonly limitKey: LimitKey;
  public readonly limit: number;
  public readonly currentUsage: number;
  public readonly currentPlan: string;

  constructor(
    limitKey: LimitKey,
    limit: number,
    currentUsage: number,
    currentPlan: string,
  ) {
    super(
      `Limit reached for "${limitKey}": ${currentUsage}/${limit} (plan: ${currentPlan})`,
    );
    this.name = "LimitReachedError";
    this.limitKey = limitKey;
    this.limit = limit;
    this.currentUsage = currentUsage;
    this.currentPlan = currentPlan;
  }
}

export class UpgradeRequiredError extends Error {
  public readonly capability: Capability;
  public readonly currentPlan: string;

  constructor(capability: Capability, currentPlan: string) {
    super(
      `Upgrade required to use "${capability}" (current plan: ${currentPlan})`,
    );
    this.name = "UpgradeRequiredError";
    this.capability = capability;
    this.currentPlan = currentPlan;
  }
}

/**
 * Non-throwing capability check. Use this in UI to decide whether to render a
 * feature, or on the server when you want to branch without throwing.
 *
 * @example
 * ```tsx
 * const entitlements = await getCurrentOrganizationEntitlements();
 * if (!hasCapability(entitlements, "ai.assistant")) {
 *   return <UpgradeCard feature="AI Assistant" />;
 * }
 * ```
 */
export function hasCapability(
  entitlements: OrganizationEntitlements,
  capability: Capability,
): boolean {
  return entitlements.capabilities.includes(capability);
}

export function getPlanLimit(
  entitlements: OrganizationEntitlements,
  limitKey: LimitKey,
): number {
  return entitlements.limits[limitKey];
}

/**
 * Throws {@link UpgradeRequiredError} if the organization's plan does not
 * include the given capability. Use this inside server mutations to make a
 * feature unreachable on plans that shouldn't have it — `withBillingErrors`
 * in the action wrapper will translate the error into a friendly upgrade
 * prompt on the client.
 *
 * @example
 * ```ts
 * // features/assistant/server/assistant-ai.ts
 * export async function streamAssistantReply(input: AssistantInput) {
 *   const entitlements = await getCurrentOrganizationEntitlements();
 *   assertCapability(entitlements, "ai.assistant");
 *   // ... call the model
 * }
 * ```
 */
export function assertCapability(
  entitlements: OrganizationEntitlements,
  capability: Capability,
): void {
  if (!hasCapability(entitlements, capability)) {
    throw new UpgradeRequiredError(capability, entitlements.planName);
  }
}

/**
 * Throws {@link LimitReachedError} when `currentUsage` has met or exceeded the
 * plan's limit for `limitKey`. You supply the current usage count — typically
 * from a Prisma `count()` inside the same transaction so the check is
 * race-safe.
 *
 * For monthly-reset metered limits prefer {@link consumeMonthlyUsage} which
 * handles the counter atomically.
 *
 * @example
 * ```ts
 * // Seat limit on organization invites
 * const memberCount = await tx.organizationMember.count({
 *   where: { organizationId },
 * });
 * assertLimit(entitlements, "organization.seats", memberCount);
 * ```
 */
export function assertLimit(
  entitlements: OrganizationEntitlements,
  limitKey: LimitKey,
  currentUsage: number,
): void {
  const limit = getPlanLimit(entitlements, limitKey);

  if (currentUsage >= limit) {
    throw new LimitReachedError(
      limitKey,
      limit,
      currentUsage,
      entitlements.planName,
    );
  }
}

export function checkLimit(
  entitlements: OrganizationEntitlements,
  limitKey: LimitKey,
  currentUsage: number,
) {
  const limit = getPlanLimit(entitlements, limitKey);

  return {
    allowed: currentUsage < limit,
    currentUsage,
    limit,
    remaining: Math.max(0, limit - currentUsage),
  };
}

const ACTIVE_BILLING_STATUSES = new Set(["active", "trialing"]);

export const CURRENT_SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "incomplete",
  "unpaid",
  "paused",
] as const;

export function hasPlanAccess(subscriptionStatus: string | null | undefined) {
  if (!subscriptionStatus) {
    return false;
  }

  return ACTIVE_BILLING_STATUSES.has(subscriptionStatus);
}

export function hasCurrentStripeSubscription(
  subscriptionStatus: string | null | undefined,
) {
  if (!subscriptionStatus) {
    return false;
  }

  return CURRENT_SUBSCRIPTION_STATUSES.includes(
    subscriptionStatus as (typeof CURRENT_SUBSCRIPTION_STATUSES)[number],
  );
}
