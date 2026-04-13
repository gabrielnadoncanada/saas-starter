import { describe, expect, it, vi } from "vitest";

import {
  assertCapability,
  assertLimit,
  checkLimit,
  getPlanLimit,
  hasCapability,
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/entitlements";
import { getPlan, isPlanId } from "@/features/billing/plans";
import type {
  OrganizationEntitlements,
  PlanId,
} from "@/shared/config/billing.config";

vi.mock("server-only", () => ({}));

function createEntitlements(planId: PlanId): OrganizationEntitlements {
  const plan = getPlan(planId);

  return {
    billingInterval: planId === "free" ? null : "month",
    capabilities: [...plan.capabilities],
    limits: { ...plan.limits },
    organizationId: "org_123",
    planId,
    planName: plan.name,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: planId === "free" ? null : "active",
    trialEnd: null,
  };
}

describe("plan catalog", () => {
  it("scales limits from free to pro to team", () => {
    const free = getPlan("free").limits;
    const pro = getPlan("pro").limits;
    const team = getPlan("team").limits;

    expect(pro.tasksPerMonth).toBeGreaterThan(free.tasksPerMonth);
    expect(team.tasksPerMonth).toBeGreaterThan(pro.tasksPerMonth);
    expect(pro.teamMembers).toBeGreaterThan(free.teamMembers);
    expect(team.teamMembers).toBeGreaterThan(pro.teamMembers);
    expect(pro.storageMb).toBeGreaterThan(free.storageMb);
    expect(team.storageMb).toBeGreaterThan(pro.storageMb);
  });

  it("keeps capability inheritance monotonic", () => {
    const freeCaps = new Set(getPlan("free").capabilities);
    const proCaps = new Set(getPlan("pro").capabilities);
    const teamCaps = new Set(getPlan("team").capabilities);

    for (const capability of freeCaps) {
      expect(proCaps.has(capability)).toBe(true);
    }

    for (const capability of proCaps) {
      expect(teamCaps.has(capability)).toBe(true);
    }
  });

  it("accepts valid plan ids only", () => {
    expect(isPlanId("free")).toBe(true);
    expect(isPlanId("pro")).toBe(true);
    expect(isPlanId("team")).toBe(true);
    expect(isPlanId("enterprise")).toBe(false);
  });
});

describe("plan guards", () => {
  it("checks capabilities from entitlements", () => {
    expect(hasCapability(createEntitlements("free"), "task.create")).toBe(true);
    expect(hasCapability(createEntitlements("free"), "task.export")).toBe(
      false,
    );
    expect(hasCapability(createEntitlements("team"), "team.analytics")).toBe(
      true,
    );
  });

  it("throws UpgradeRequiredError with the plan name", () => {
    expect(() =>
      assertCapability(createEntitlements("free"), "team.invite"),
    ).toThrow(UpgradeRequiredError);

    try {
      assertCapability(createEntitlements("free"), "team.invite");
      expect.unreachable("expected upgrade error");
    } catch (error) {
      expect(error).toBeInstanceOf(UpgradeRequiredError);
      expect((error as UpgradeRequiredError).planName).toBe("Free");
    }
  });

  it("returns limits from entitlements", () => {
    expect(getPlanLimit(createEntitlements("free"), "tasksPerMonth")).toBe(10);
    expect(getPlanLimit(createEntitlements("pro"), "tasksPerMonth")).toBe(1000);
    expect(getPlanLimit(createEntitlements("team"), "tasksPerMonth")).toBe(
      10000,
    );
  });

  it("reports remaining quota correctly", () => {
    expect(checkLimit(createEntitlements("free"), "tasksPerMonth", 5)).toEqual({
      allowed: true,
      currentUsage: 5,
      limit: 10,
      remaining: 5,
    });

    expect(checkLimit(createEntitlements("free"), "tasksPerMonth", 10)).toEqual(
      {
        allowed: false,
        currentUsage: 10,
        limit: 10,
        remaining: 0,
      },
    );
  });

  it("throws LimitReachedError with limit details", () => {
    expect(() =>
      assertLimit(createEntitlements("free"), "tasksPerMonth", 10),
    ).toThrow(LimitReachedError);

    try {
      assertLimit(createEntitlements("free"), "teamMembers", 1);
      expect.unreachable("expected limit error");
    } catch (error) {
      expect(error).toBeInstanceOf(LimitReachedError);
      expect((error as LimitReachedError).limit).toBe(1);
      expect((error as LimitReachedError).planName).toBe("Free");
    }
  });
});
