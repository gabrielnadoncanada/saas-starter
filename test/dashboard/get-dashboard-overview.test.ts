import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/features/organizations/server/current-organization", () => ({
  getCurrentOrganization: vi.fn(),
}));

vi.mock("@/features/billing/server/organization-entitlements", () => ({
  getCurrentOrganizationEntitlements: vi.fn(),
}));

vi.mock("@/features/billing/catalog", () => ({
  getPlan: vi.fn(() => ({
    id: "pro",
    name: "Pro",
  })),
}));

vi.mock("@/features/billing/server/usage-service", () => ({
  getMonthlyUsage: vi.fn(),
}));

vi.mock("@/features/billing/plan-guards", () => ({
  checkLimit: vi.fn(() => ({
    allowed: true,
    limit: 100,
    remaining: 90,
    currentUsage: 10,
  })),
  hasCapability: vi.fn(() => true),
}));

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {
    task: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    aiConversation: {
      count: vi.fn(),
    },
  },
}));

const { getCurrentOrganization } =
  await import("@/features/organizations/server/current-organization");
const { getCurrentOrganizationEntitlements } =
  await import("@/features/billing/server/organization-entitlements");
const { getMonthlyUsage } =
  await import("@/features/billing/server/usage-service");
const { db } = await import("@/shared/lib/db/prisma");
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
    vi.mocked(getCurrentOrganizationEntitlements).mockResolvedValue({
      organizationId: "org_123",
      planId: "pro",
      planName: "Pro",
      limits: { tasksPerMonth: 1000, teamMembers: 5, storageMb: 5000 },
      capabilities: ["ai.assistant", "team.invite"],
      billingInterval: "month",
      oneTimeProductIds: [],
      pricingModel: "flat",
      seats: null,
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
      .mockResolvedValueOnce([{ createdAt: new Date() }] as never);
    vi.mocked(getMonthlyUsage).mockResolvedValue(3 as never);
  });

  it("uses count plus scoped recent-task queries instead of loading every task", async () => {
    const overview = await getDashboardOverview();

    expect(db.task.count).toHaveBeenCalledWith({
      where: { organizationId: "org_123" },
    });
    expect(db.aiConversation.count).toHaveBeenCalledWith({
      where: { organizationId: "org_123" },
    });
    expect(db.task.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { organizationId: "org_123" },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    );
    expect(db.task.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org_123",
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
