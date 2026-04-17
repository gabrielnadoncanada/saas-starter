import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/organizations/server/organizations", () => ({
  getCurrentOrganization: vi.fn(),
}));

vi.mock("@/features/billing/server/organization-entitlements", () => ({
  getCurrentEntitlements: vi.fn(),
}));

vi.mock("@/features/billing/server/usage-service", () => ({
  getMonthlyUsage: vi.fn(),
}));

vi.mock("@/features/billing/entitlements", () => ({
  checkLimit: vi.fn(() => ({
    allowed: true,
    limit: 100,
    remaining: 90,
    currentUsage: 10,
  })),
  hasCapability: vi.fn(() => true),
  getDefaultEntitlements: vi.fn(),
}));

vi.mock("@/features/billing/plans", () => ({
  getPlan: vi.fn(() => ({
    id: "pro",
    name: "Pro",
  })),
}));

vi.mock("@/lib/db/prisma", () => ({
  db: {
    task: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    aiConversation: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    member: {
      findMany: vi.fn(),
    },
  },
}));

const { getCurrentOrganization } =
  await import("@/features/organizations/server/organizations");
const { getCurrentEntitlements } =
  await import("@/features/billing/server/organization-entitlements");
const { getMonthlyUsage } =
  await import("@/features/billing/server/usage-service");
const { db } = await import("@/lib/db/prisma");
const { getDashboardOverview } =
  await import("@/features/dashboard/server/get-dashboard-overview");

describe("getDashboardOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getCurrentOrganization).mockResolvedValue({
      id: "org_123",
      name: "Acme",
      members: [{ id: "member_1" }],
    } as never);
    vi.mocked(getCurrentEntitlements).mockResolvedValue({
      organizationId: "org_123",
      planId: "pro",
      planName: "Pro",
      limits: { tasksPerMonth: 1000, teamMembers: 5, storageMb: 5000 },
      capabilities: ["ai.assistant", "team.invite"],
      billingInterval: "month",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "active",
    } as never);
    vi.mocked(db.task.count).mockResolvedValue(42 as never);
    vi.mocked(db.aiConversation.count).mockResolvedValue(2 as never);
    vi.mocked(db.task.findMany)
      .mockResolvedValueOnce([
        { id: 1, title: "Recent", createdAt: new Date() },
      ] as never)
      .mockResolvedValueOnce([{ createdAt: new Date() }] as never)
      .mockResolvedValueOnce([] as never);
    vi.mocked(db.aiConversation.findMany).mockResolvedValue([] as never);
    vi.mocked(db.member.findMany).mockResolvedValue([] as never);
    vi.mocked(getMonthlyUsage).mockResolvedValue(3 as never);
  });

  it("uses count plus scoped recent-task queries instead of loading every task", async () => {
    const overview = await getDashboardOverview();

    expect(db.task.count).toHaveBeenCalledWith();
    expect(db.aiConversation.count).toHaveBeenCalledWith();
    expect(db.task.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    );
    expect(db.task.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.any(Object),
        }),
        select: { createdAt: true },
      }),
    );
    expect(overview.taskCount).toBe(42);
    expect(overview.assistantConversationCount).toBe(2);
    expect(overview.recentTasks).toHaveLength(1);
  });
});
