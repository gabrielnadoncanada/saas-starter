import { describe, expect, it } from "vitest";

import { resolveOrganizationPlan } from "@/features/billing/plans/resolve-organization-plan";
import { hasPlanAccess } from "@/features/billing/plans/subscription-status";

describe("resolveOrganizationPlan", () => {
  it("returns the paid plan only while billing access is active", () => {
    expect(
      resolveOrganizationPlan({ planId: "pro", subscriptionStatus: "active" }),
    ).toBe("pro");
    expect(
      resolveOrganizationPlan({
        planId: "pro",
        subscriptionStatus: "trialing",
      }),
    ).toBe("pro");
  });

  it("downgrades blocked subscription statuses to free access", () => {
    expect(
      resolveOrganizationPlan({
        planId: "pro",
        subscriptionStatus: "past_due",
      }),
    ).toBe("free");
    expect(
      resolveOrganizationPlan({
        planId: "team",
        subscriptionStatus: "canceled",
      }),
    ).toBe("free");
    expect(resolveOrganizationPlan(null)).toBe("free");
  });
});

describe("hasPlanAccess", () => {
  it("accepts only active billing statuses", () => {
    expect(hasPlanAccess("active")).toBe(true);
    expect(hasPlanAccess("trialing")).toBe(true);
    expect(hasPlanAccess("past_due")).toBe(false);
    expect(hasPlanAccess("unpaid")).toBe(false);
    expect(hasPlanAccess(null)).toBe(false);
  });
});
