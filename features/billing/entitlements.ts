// Entitlements — gate features by plan capabilities and enforce usage quotas.
// assertCapability() guards feature access. assertLimit() / checkLimit() enforce quotas.
// Plan definitions live in config/billing.config.ts.

import type {
  Capability,
  LimitKey,
  OrganizationEntitlements,
} from "@/config/billing.config";
import { getPlan } from "@/features/billing/plans";

export class LimitReachedError extends Error {
  public readonly limitKey: LimitKey;
  public readonly limit: number;
  public readonly currentUsage: number;
  public readonly planName: string;

  constructor(
    limitKey: LimitKey,
    limit: number,
    currentUsage: number,
    planName: string,
  ) {
    super(
      `Limit reached for "${limitKey}": ${currentUsage}/${limit} (plan: ${planName})`,
    );
    this.name = "LimitReachedError";
    this.limitKey = limitKey;
    this.limit = limit;
    this.currentUsage = currentUsage;
    this.planName = planName;
  }
}

export class UpgradeRequiredError extends Error {
  public readonly capability: Capability;
  public readonly planName: string;

  constructor(capability: Capability, planName: string) {
    super(
      `Upgrade required to use "${capability}" (current plan: ${planName})`,
    );
    this.name = "UpgradeRequiredError";
    this.capability = capability;
    this.planName = planName;
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

export function getDefaultEntitlements(params: {
  organizationId: string;
}): OrganizationEntitlements {
  const plan = getPlan("free");

  return {
    billingInterval: null,
    capabilities: [...plan.capabilities],
    limits: { ...plan.limits },
    organizationId: params.organizationId,
    planId: "free",
    planName: plan.name,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
    trialEnd: null,
  };
}
