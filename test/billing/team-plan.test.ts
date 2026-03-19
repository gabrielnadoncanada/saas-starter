import { describe, expect, it } from "vitest";

import { hasPlanAccess, resolveTeamPlan } from "@/features/billing/plans";

describe("resolveTeamPlan", () => {
  it("returns the paid plan only while billing access is active", () => {
    expect(
      resolveTeamPlan({ planId: "pro", subscriptionStatus: "active" }),
    ).toBe("pro");
    expect(
      resolveTeamPlan({ planId: "pro", subscriptionStatus: "trialing" }),
    ).toBe("pro");
    expect(
      resolveTeamPlan({ planId: "pro", subscriptionStatus: "lifetime" }),
    ).toBe("pro");
  });

  it("downgrades blocked subscription statuses to free access", () => {
    expect(
      resolveTeamPlan({ planId: "pro", subscriptionStatus: "past_due" }),
    ).toBe("free");
    expect(
      resolveTeamPlan({ planId: "team", subscriptionStatus: "canceled" }),
    ).toBe("free");
    expect(resolveTeamPlan(null)).toBe("free");
  });
});

describe("hasPlanAccess", () => {
  it("accepts only active billing statuses", () => {
    expect(hasPlanAccess("active")).toBe(true);
    expect(hasPlanAccess("trialing")).toBe(true);
    expect(hasPlanAccess("lifetime")).toBe(true);
    expect(hasPlanAccess("past_due")).toBe(false);
    expect(hasPlanAccess("unpaid")).toBe(false);
    expect(hasPlanAccess(null)).toBe(false);
  });
});
