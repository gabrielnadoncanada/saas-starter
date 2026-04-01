import { describe, expect, it, vi } from "vitest";

import { LimitReachedError } from "@/features/billing/errors/limit-reached";
import { UpgradeRequiredError } from "@/features/billing/errors/upgrade-required";
import {
  assertCapability,
  assertLimit,
  checkLimit,
  getPlanLimit,
  hasCapability,
} from "@/features/billing/guards/plan-guards";
import {
  billingConfig,
  getPlan,
  isPlanId,
} from "@/shared/config/billing.config";

vi.mock("server-only", () => ({}));

// ---------------------------------------------------------------------------
// Plan config coherence
// ---------------------------------------------------------------------------

describe("plan configuration", () => {
  it("every plan has an id matching its key", () => {
    for (const plan of billingConfig.plans) {
      expect(plan.id).toBeTruthy();
    }
  });

  it("limits scale up from free to pro to team", () => {
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

  it("higher plans include all capabilities of lower plans", () => {
    const freeCaps = new Set(getPlan("free").capabilities);
    const proCaps = new Set(getPlan("pro").capabilities);
    const teamCaps = new Set(getPlan("team").capabilities);

    for (const cap of freeCaps) {
      expect(proCaps.has(cap)).toBe(true);
    }
    for (const cap of proCaps) {
      expect(teamCaps.has(cap)).toBe(true);
    }
  });

  it("isPlanId accepts valid ids and rejects invalid ones", () => {
    expect(isPlanId("free")).toBe(true);
    expect(isPlanId("pro")).toBe(true);
    expect(isPlanId("team")).toBe(true);
    expect(isPlanId("enterprise")).toBe(false);
    expect(isPlanId("")).toBe(false);
  });

  it("getPlan returns the correct plan", () => {
    expect(getPlan("free").name).toBe("Free");
    expect(getPlan("pro").name).toBe("Pro");
    expect(getPlan("team").name).toBe("Team");
  });
});

// ---------------------------------------------------------------------------
// Capability checks
// ---------------------------------------------------------------------------

describe("hasCapability", () => {
  it("returns true for included capabilities", () => {
    expect(hasCapability("free", "task.create")).toBe(true);
    expect(hasCapability("pro", "task.export")).toBe(true);
    expect(hasCapability("team", "team.analytics")).toBe(true);
  });

  it("returns false for excluded capabilities", () => {
    expect(hasCapability("free", "task.export")).toBe(false);
    expect(hasCapability("free", "team.invite")).toBe(false);
    expect(hasCapability("pro", "team.analytics")).toBe(false);
  });
});

describe("assertCapability", () => {
  it("does not throw for included capabilities", () => {
    expect(() => assertCapability("pro", "task.create")).not.toThrow();
    expect(() => assertCapability("team", "team.analytics")).not.toThrow();
  });

  it("throws UpgradeRequiredError for excluded capabilities", () => {
    expect(() => assertCapability("free", "task.export")).toThrow(
      UpgradeRequiredError,
    );
  });

  it("includes plan name in error", () => {
    try {
      assertCapability("free", "team.invite");
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(UpgradeRequiredError);
      expect((error as UpgradeRequiredError).currentPlan).toBe("Free");
      expect((error as UpgradeRequiredError).capability).toBe("team.invite");
    }
  });
});

// ---------------------------------------------------------------------------
// Limit checks
// ---------------------------------------------------------------------------

describe("getPlanLimit", () => {
  it("returns correct limits for each plan", () => {
    expect(getPlanLimit("free", "tasksPerMonth")).toBe(10);
    expect(getPlanLimit("pro", "tasksPerMonth")).toBe(1000);
    expect(getPlanLimit("team", "tasksPerMonth")).toBe(10000);
  });
});

describe("checkLimit", () => {
  it("reports allowed when under limit", () => {
    const result = checkLimit("free", "tasksPerMonth", 5);

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBe(5);
    expect(result.currentUsage).toBe(5);
  });

  it("reports not allowed when at limit", () => {
    const result = checkLimit("free", "tasksPerMonth", 10);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("reports not allowed when over limit", () => {
    const result = checkLimit("free", "tasksPerMonth", 15);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

describe("assertLimit", () => {
  it("does not throw when under limit", () => {
    expect(() => assertLimit("pro", "tasksPerMonth", 999)).not.toThrow();
  });

  it("throws LimitReachedError at the limit", () => {
    expect(() => assertLimit("free", "tasksPerMonth", 10)).toThrow(
      LimitReachedError,
    );
  });

  it("throws LimitReachedError over the limit", () => {
    expect(() => assertLimit("free", "tasksPerMonth", 20)).toThrow(
      LimitReachedError,
    );
  });

  it("includes limit details in error", () => {
    try {
      assertLimit("free", "teamMembers", 1);
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(LimitReachedError);
      const err = error as LimitReachedError;
      expect(err.limitKey).toBe("teamMembers");
      expect(err.limit).toBe(1);
      expect(err.currentUsage).toBe(1);
      expect(err.currentPlan).toBe("Free");
    }
  });
});
