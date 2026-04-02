import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/errors/billing-errors";

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

vi.mock("@/features/billing/guards/get-organization-plan", () => ({
  getOrganizationPlan: vi.fn(),
}));

vi.mock("@/features/billing/guards/plan-guards", () => ({
  assertCapability: vi.fn(),
}));

vi.mock("@/features/billing/usage/usage-service", () => ({
  consumeMonthlyUsage: vi.fn(),
}));

const { db } = await import("@/shared/lib/db/prisma");
const { getOrganizationPlan } =
  await import("@/features/billing/guards/get-organization-plan");
const { assertCapability } =
  await import("@/features/billing/guards/plan-guards");
const { consumeMonthlyUsage } =
  await import("@/features/billing/usage/usage-service");
const { createTaskForCurrentOrganization } =
  await import("@/features/tasks/server/task-mutations");

describe("createTaskForCurrentOrganization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.$transaction).mockImplementation(async (callback: any) =>
      callback(db),
    );

    vi.mocked(getOrganizationPlan).mockResolvedValue({
      planId: "pro",
      organizationId: "12",
      organizationName: "Acme",
      subscriptionStatus: "active",
      pricingModel: "flat",
    });
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
      createTaskForCurrentOrganization({
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
      new LimitReachedError("tasksPerMonth", 10, 10, "Pro"),
    );

    await expect(
      createTaskForCurrentOrganization({
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
      "pro",
      { db },
    );
  });

  it("creates the task after reserving usage in the transaction", async () => {
    const task = await createTaskForCurrentOrganization({
      title: "Ship billing fix",
      description: "Close the billing gap",
      label: "FEATURE",
      priority: "HIGH",
    });

    expect(assertCapability).toHaveBeenCalledWith("pro", "task.create");
    expect(consumeMonthlyUsage).toHaveBeenCalledWith(
      "12",
      "tasksPerMonth",
      "pro",
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
