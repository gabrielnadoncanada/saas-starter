import { beforeEach, describe, expect, it, vi } from "vitest";

import { LimitReachedError, UpgradeRequiredError } from "@/features/billing/errors";

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

vi.mock("@/features/billing/guards/get-team-plan", () => ({
  getTeamPlan: vi.fn(),
}));

vi.mock("@/features/billing/guards", () => ({
  assertCapability: vi.fn(),
}));

vi.mock("@/features/billing/usage", () => ({
  consumeMonthlyUsage: vi.fn(),
}));

const { db } = await import("@/shared/lib/db/prisma");
const { getTeamPlan } = await import("@/features/billing/guards/get-team-plan");
const { assertCapability } = await import("@/features/billing/guards");
const { consumeMonthlyUsage } = await import(
  "@/features/billing/usage"
);
const { createTaskForCurrentTeam } = await import(
  "@/features/tasks/server/create-task-for-current-team"
);

describe("createTaskForCurrentTeam", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.$transaction).mockImplementation(async (callback: any) => callback(db));

    vi.mocked(getTeamPlan).mockResolvedValue({
      planId: "pro",
      organizationId: "12",
      teamName: "Acme",
      subscriptionStatus: "active",
      pricingModel: "flat",
    });
    vi.mocked(assertCapability).mockImplementation(() => {});
    vi.mocked(consumeMonthlyUsage).mockResolvedValue(undefined);
    vi.mocked(db.task.findFirst).mockResolvedValue({ code: "TASK-41" } as never);
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
      createTaskForCurrentTeam({
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
      createTaskForCurrentTeam({
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
    const task = await createTaskForCurrentTeam({
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
