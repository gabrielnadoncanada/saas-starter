import { describe, expect, it, vi } from "vitest";

import { LimitReachedError } from "@/features/billing/errors";
import { consumeMonthlyUsage } from "@/features/billing/usage";

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {},
}));

type UsageDbClient = NonNullable<Parameters<typeof consumeMonthlyUsage>[3]>["db"];

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
      consumeMonthlyUsage("12", "aiRequestsPerMonth", "pro", { db }),
    ).resolves.toBeUndefined();

    expect(db.usageCounter.createMany).toHaveBeenCalledOnce();
    expect(db.usageCounter.updateMany).toHaveBeenCalledOnce();
  });

  it("throws LimitReachedError when the monthly limit is exhausted", async () => {
    const db = createUsageDb({
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      findUnique: vi.fn().mockResolvedValue({ count: 100 }),
    });

    await expect(
      consumeMonthlyUsage("12", "aiRequestsPerMonth", "pro", { db }),
    ).rejects.toBeInstanceOf(LimitReachedError);
  });
});
