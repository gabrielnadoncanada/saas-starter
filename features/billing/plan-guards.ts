import type {
  Capability,
  LimitKey,
  OrganizationEntitlements,
} from "@/shared/config/billing.config";

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

export function assertCapability(
  entitlements: OrganizationEntitlements,
  capability: Capability,
): void {
  if (!hasCapability(entitlements, capability)) {
    throw new UpgradeRequiredError(capability, entitlements.planName);
  }
}

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
