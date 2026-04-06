import type {
  Capability,
  LimitKey,
  OrganizationEntitlements,
} from "@/shared/config/billing.config";

import {
  LimitReachedError,
  UpgradeRequiredError,
} from "./billing-errors";

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
