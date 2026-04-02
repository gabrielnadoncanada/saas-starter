import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/features/api-keys/server/api-key-service", () => ({
  authenticateApiKey: vi.fn(),
}));

vi.mock("@/features/billing/server/stripe/stripe-subscriptions", () => ({
  getOrganizationSubscriptionSnapshot: vi.fn(),
}));

vi.mock("@/features/billing/plans/resolve-organization-plan", () => ({
  resolveOrganizationPlan: vi.fn(),
}));

vi.mock("@/features/billing/guards/plan-guards", () => ({
  hasCapability: vi.fn(),
}));

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {
    organization: {
      findUnique: vi.fn(),
    },
  },
}));

const { requireApiKey } = await import("@/features/api/server/require-api-key");
const { authenticateApiKey } = await import(
  "@/features/api-keys/server/api-key-service"
);
const { getOrganizationSubscriptionSnapshot } = await import(
  "@/features/billing/server/stripe/stripe-subscriptions"
);
const { resolveOrganizationPlan } = await import(
  "@/features/billing/plans/resolve-organization-plan"
);
const { hasCapability } = await import("@/features/billing/guards/plan-guards");
const { db } = await import("@/shared/lib/db/prisma");

describe("requireApiKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(authenticateApiKey).mockResolvedValue({
      id: "key_123",
      organizationId: "org_123",
      capabilities: ["api.access", "task.create"],
    } as never);
    vi.mocked(db.organization.findUnique).mockResolvedValue({
      id: "org_123",
      name: "Acme",
      slug: "acme",
    } as never);
    vi.mocked(getOrganizationSubscriptionSnapshot).mockResolvedValue({
      planId: "pro",
      subscriptionStatus: "active",
      billingInterval: "month",
      pricingModel: "flat",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
    } as never);
    vi.mocked(resolveOrganizationPlan).mockReturnValue("pro");
    vi.mocked(hasCapability).mockReturnValue(true);
  });

  it("returns null when the bearer header is missing", async () => {
    const request = new Request("http://localhost/api/v1/tasks");

    await expect(requireApiKey(request, "api.access")).resolves.toBeNull();
    expect(authenticateApiKey).not.toHaveBeenCalled();
  });

  it("returns the request context when the key and plan both allow the capability", async () => {
    const request = new Request("http://localhost/api/v1/tasks", {
      headers: {
        authorization: "Bearer ssk_secret",
      },
    });

    const context = await requireApiKey(request, "task.create");

    expect(authenticateApiKey).toHaveBeenCalledWith("ssk_secret");
    expect(context).toEqual({
      apiKey: expect.objectContaining({ id: "key_123" }),
      organization: {
        id: "org_123",
        name: "Acme",
        slug: "acme",
      },
      planId: "pro",
    });
  });

  it("returns null when the api key does not include the required capability", async () => {
    vi.mocked(authenticateApiKey).mockResolvedValue({
      id: "key_123",
      organizationId: "org_123",
      capabilities: ["api.access"],
    } as never);

    const request = new Request("http://localhost/api/v1/tasks", {
      headers: {
        authorization: "Bearer ssk_secret",
      },
    });

    await expect(requireApiKey(request, "task.create")).resolves.toBeNull();
    expect(hasCapability).not.toHaveBeenCalled();
  });

  it("returns null when the organization plan does not allow the capability", async () => {
    vi.mocked(hasCapability).mockReturnValue(false);

    const request = new Request("http://localhost/api/v1/tasks", {
      headers: {
        authorization: "Bearer ssk_secret",
      },
    });

    await expect(requireApiKey(request, "task.create")).resolves.toBeNull();
  });
});
