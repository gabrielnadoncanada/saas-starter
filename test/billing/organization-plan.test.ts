import { describe, expect, it } from "vitest";

import {
  applyEntitlementDeltas,
  getDefaultEntitlements,
} from "@/features/billing/catalog/resolver";
import {
  hasCurrentStripeSubscription,
  hasPlanAccess,
} from "@/features/billing/plans/subscription-status";

describe("subscription status gating", () => {
  it("keeps paid access only for active billing states", () => {
    expect(hasPlanAccess("active")).toBe(true);
    expect(hasPlanAccess("trialing")).toBe(true);
    expect(hasPlanAccess("past_due")).toBe(false);
    expect(hasPlanAccess("canceled")).toBe(false);
    expect(hasPlanAccess(null)).toBe(false);
  });

  it("tracks whether a Stripe subscription still exists", () => {
    expect(hasCurrentStripeSubscription("active")).toBe(true);
    expect(hasCurrentStripeSubscription("paused")).toBe(true);
    expect(hasCurrentStripeSubscription("canceled")).toBe(false);
    expect(hasCurrentStripeSubscription(null)).toBe(false);
  });
});

describe("entitlement deltas", () => {
  it("merges recurring add-ons and one-time products into the base entitlements", () => {
    const base = getDefaultEntitlements({
      organizationId: "org_123",
      creditBalance: 200,
      creditBalancePurchased: 100,
      creditBalanceSubscription: 100,
    });

    const entitlements = applyEntitlementDeltas(base, {
      activeAddonIds: ["analytics"],
      oneTimeProductIds: ["storage_boost"],
    });

    expect(entitlements.capabilities).toContain("team.analytics");
    expect(entitlements.limits.storageMb).toBe(base.limits.storageMb + 10_000);
    expect(entitlements.activeAddonIds).toEqual(["analytics"]);
    expect(entitlements.oneTimeProductIds).toEqual(["storage_boost"]);
  });
});
