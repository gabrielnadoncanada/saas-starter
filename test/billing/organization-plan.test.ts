import { describe, expect, it } from "vitest";

import {
  hasOngoingSubscription,
  hasPlanAccess,
  isTrialingSubscription,
} from "@/features/billing/plans";

describe("subscription status gating", () => {
  it("keeps paid access only for active billing states", () => {
    expect(hasPlanAccess("active")).toBe(true);
    expect(hasPlanAccess("trialing")).toBe(true);
    expect(hasPlanAccess("past_due")).toBe(false);
    expect(hasPlanAccess("canceled")).toBe(false);
    expect(hasPlanAccess(null)).toBe(false);
  });

  it("tracks whether a Stripe subscription still exists", () => {
    expect(hasOngoingSubscription("active")).toBe(true);
    expect(hasOngoingSubscription("paused")).toBe(true);
    expect(hasOngoingSubscription("canceled")).toBe(false);
    expect(hasOngoingSubscription(null)).toBe(false);
  });

  it("flags trial subscriptions explicitly", () => {
    expect(isTrialingSubscription("trialing")).toBe(true);
    expect(isTrialingSubscription("active")).toBe(false);
    expect(isTrialingSubscription(null)).toBe(false);
  });
});
