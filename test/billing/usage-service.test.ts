import { describe, expect, it, vi } from "vitest";

import { getPlan } from "@/features/billing/catalog";
import { LimitReachedError } from "@/features/billing/plan-guards";
import { consumeMonthlyUsage } from "@/features/billing/server/usage-service";
import type { OrganizationEntitlements } from "@/shared/config/billing.config";

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {},
}));

function createEntitlements(): OrganizationEntitlements {
  const plan = getPlan("pro");

  return {
    billingInterval: "month",
    capabilities: [...plan.capabilities],
    limits: { ...plan.limits },
    oneTimeProductIds: [],
    organizationId: "org_123",
    planId: "pro",
    planName: plan.name,
    pricingModel: plan.pricingModel,
    seats: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: "active",
  };
}

type UsageDbClient = NonNullable<
  Parameters<typeof consumeMonthlyUsage>[3]
>["db"];

function createUsageDb(overrides: Record<string, unknown> = {}) {
  return {
    usageCounter: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      findUnique: vi.fn().mockResolvedValue({ count: 0 }),
      ...overrides,
    },
  } as unknown as UsageDbClient;
}

describe("consumeMonthlyUsage", () => {
  it("seeds the monthly counter without failing on duplicates", async () => {
    const db = createUsageDb({
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
    });

    await expect(
      consumeMonthlyUsage("org_123", "tasksPerMonth", createEntitlements(), {
        db,
      }),
    ).resolves.toBeUndefined();

    expect(db.usageCounter.createMany).toHaveBeenCalledOnce();
    expect(db.usageCounter.updateMany).toHaveBeenCalledOnce();
  });

  it("throws LimitReachedError when the monthly limit is exhausted", async () => {
    const db = createUsageDb({
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      findUnique: vi.fn().mockResolvedValue({ count: 1000 }),
    });

    await expect(
      consumeMonthlyUsage("org_123", "tasksPerMonth", createEntitlements(), {
        db,
      }),
    ).rejects.toBeInstanceOf(LimitReachedError);
  });
});
