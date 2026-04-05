import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/features/billing/server/organization-entitlements", () => ({
  getCurrentOrganizationEntitlements: vi.fn(),
}));

const { getCurrentOrganizationEntitlements } = await import(
  "@/features/billing/server/organization-entitlements"
);
const { assertOrganizationAiAccess } = await import(
  "@/features/assistant/server/organization-ai-access"
);

describe("assertOrganizationAiAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("asserts organization AI access from entitlements", async () => {
    vi.mocked(getCurrentOrganizationEntitlements).mockResolvedValue({
      organizationId: "org_1",
      planId: "pro",
      planName: "Pro",
      limits: {
        tasksPerMonth: 1000,
        teamMembers: 5,
        storageMb: 5000,
      },
      capabilities: ["ai.assistant"],
      billingInterval: "month",
      oneTimeProductIds: [],
      pricingModel: "flat",
      seats: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "active",
    } as never);

    await expect(assertOrganizationAiAccess()).resolves.toEqual(
      expect.objectContaining({
        organizationId: "org_1",
        planId: "pro",
      }),
    );
  });
});
