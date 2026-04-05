import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/billing-errors";

vi.mock("server-only", () => ({}));

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {
    task: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/features/billing/server/organization-entitlements", () => ({
  getCurrentOrganizationEntitlements: vi.fn(),
}));

vi.mock("@/features/billing/plan-guards", () => ({
  assertCapability: vi.fn(),
}));

vi.mock("@/features/billing/server/usage-service", () => ({
  consumeMonthlyUsage: vi.fn(),
}));

const { db } = await import("@/shared/lib/db/prisma");
const { getCurrentOrganizationEntitlements } =
  await import("@/features/billing/server/organization-entitlements");
const { assertCapability } =
  await import("@/features/billing/plan-guards");
const { consumeMonthlyUsage } =
  await import("@/features/billing/server/usage-service");
const { createTask } = await import("@/features/tasks/server/task-mutations");

const entitlements = {
  organizationId: "12",
  planId: "pro",
  planName: "Pro",
  limits: { tasksPerMonth: 1000, teamMembers: 5, storageMb: 5000 },
  capabilities: ["task.create"],
  billingInterval: "month",
  oneTimeProductIds: [],
  pricingModel: "flat",
  seats: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: "active",
} as const;

describe("createTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.$transaction).mockImplementation(async (callback: any) =>
      callback(db),
    );
    vi.mocked(getCurrentOrganizationEntitlements).mockResolvedValue(
      entitlements as never,
    );
    vi.mocked(assertCapability).mockImplementation(() => {});
    vi.mocked(consumeMonthlyUsage).mockResolvedValue(undefined);
    vi.mocked(db.task.findFirst).mockResolvedValue({
      code: "TASK-41",
    } as never);
    vi.mocked(db.task.create).mockResolvedValue({
      code: "TASK-42",
      title: "Ship billing fix",
      status: "TODO",
    } as never);
  });

  it("refuses task creation when capability check fails", async () => {
    vi.mocked(assertCapability).mockImplementation(() => {
      throw new UpgradeRequiredError("task.create", "Free");
    });

    await expect(
      createTask({
        title: "Ship billing fix",
        description: "Close the billing gap",
        label: "FEATURE",
        priority: "HIGH",
      }),
    ).rejects.toBeInstanceOf(UpgradeRequiredError);

    expect(db.task.create).not.toHaveBeenCalled();
    expect(consumeMonthlyUsage).not.toHaveBeenCalled();
  });

  it("refuses task creation when the monthly limit is reached", async () => {
    vi.mocked(consumeMonthlyUsage).mockRejectedValue(
      new LimitReachedError("tasksPerMonth", 1000, 1000, "Pro"),
    );

    await expect(
      createTask({
        title: "Ship billing fix",
        description: "Close the billing gap",
        label: "FEATURE",
        priority: "HIGH",
      }),
    ).rejects.toBeInstanceOf(LimitReachedError);

    expect(db.task.create).not.toHaveBeenCalled();
    expect(consumeMonthlyUsage).toHaveBeenCalledWith(
      "12",
      "tasksPerMonth",
      entitlements,
      { db },
    );
  });

  it("creates the task after reserving usage in the transaction", async () => {
    const task = await createTask({
      title: "Ship billing fix",
      description: "Close the billing gap",
      label: "FEATURE",
      priority: "HIGH",
    });

    expect(assertCapability).toHaveBeenCalledWith(entitlements, "task.create");
    expect(consumeMonthlyUsage).toHaveBeenCalledWith(
      "12",
      "tasksPerMonth",
      entitlements,
      { db },
    );
    expect(db.task.create).toHaveBeenCalledWith({
      data: {
        organizationId: "12",
        code: "TASK-42",
        title: "Ship billing fix",
        description: "Close the billing gap",
        label: "FEATURE",
        priority: "HIGH",
        status: "TODO",
      },
    });
    expect(task.code).toBe("TASK-42");
  });
});
