import { describe, expect, it } from "vitest";

import {
  hasCurrentStripeSubscription,
  hasPlanAccess,
} from "@/features/billing/plan-guards";
import { applyOneTimePurchaseLimits } from "@/features/billing/server/organization-entitlements";

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

describe("one-time purchase limits", () => {
  it("adds storage when storage_boost was purchased", () => {
    const limits = {
      tasksPerMonth: 10,
      teamMembers: 1,
      storageMb: 100,
    };

    const next = applyOneTimePurchaseLimits(limits, ["storage_boost"]);

    expect(next.storageMb).toBe(100 + 10_000);
    expect(next.tasksPerMonth).toBe(10);
  });

  it("leaves limits unchanged when no matching purchase", () => {
    const limits = {
      tasksPerMonth: 10,
      teamMembers: 1,
      storageMb: 100,
    };

    expect(applyOneTimePurchaseLimits(limits, [])).toEqual(limits);
  });
});
