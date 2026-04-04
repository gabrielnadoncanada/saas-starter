import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {
    organizationAiSettings: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/features/billing/server/organization-entitlements", () => ({
  getCurrentOrganizationEntitlements: vi.fn(),
}));

const { db } = await import("@/shared/lib/db/prisma");
const { getCurrentOrganizationEntitlements } = await import(
  "@/features/billing/server/organization-entitlements"
);
const {
  assertOrganizationAiAccess,
  getOrganizationAiSettings,
  listAllowedAiModelsForOrganization,
  updateOrganizationAiSettings,
} = await import("@/features/assistant/server/organization-ai-settings");

describe("organization ai settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates default organization settings on first read", async () => {
    vi.mocked(db.organizationAiSettings.upsert).mockResolvedValue({
      organizationId: "org_1",
      allowedModelIds: ["gemini-2.5-flash", "llama-3.1-8b-instant"],
      defaultModelId: "gemini-2.5-flash",
    } as never);

    const settings = await getOrganizationAiSettings("org_1");

    expect(db.organizationAiSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: "org_1" },
        create: expect.objectContaining({
          organizationId: "org_1",
          defaultModelId: "gemini-2.5-flash",
        }),
      }),
    );
    expect(settings.allowedModelIds).toEqual([
      "gemini-2.5-flash",
      "llama-3.1-8b-instant",
    ]);
  });

  it("rejects an unknown model id during update", async () => {
    await expect(
      updateOrganizationAiSettings("org_1", {
        allowedModelIds: ["gemini-2.5-flash", "unknown-model"],
        defaultModelId: "gemini-2.5-flash",
      }),
    ).rejects.toThrow("Unknown AI model: unknown-model");
  });

  it("rejects a default model outside the allowed set", async () => {
    await expect(
      updateOrganizationAiSettings("org_1", {
        allowedModelIds: ["gemini-2.5-flash"],
        defaultModelId: "llama-3.1-8b-instant",
      }),
    ).rejects.toThrow("The default AI model must be one of the allowed models.");
  });

  it("returns the allowed models for the organization", async () => {
    vi.mocked(db.organizationAiSettings.upsert).mockResolvedValue({
      organizationId: "org_1",
      allowedModelIds: ["llama-3.1-8b-instant"],
      defaultModelId: "llama-3.1-8b-instant",
    } as never);

    const models = await listAllowedAiModelsForOrganization("org_1");

    expect(models).toEqual([
      {
        id: "llama-3.1-8b-instant",
        name: "Llama 3.1 8B Instant",
        provider: "groq",
        providerLabel: "Groq",
      },
    ]);
  });

  it("asserts organization AI access from entitlements", async () => {
    vi.mocked(getCurrentOrganizationEntitlements).mockResolvedValue({
      organizationId: "org_1",
      planId: "pro",
      planName: "Pro",
      limits: { tasksPerMonth: 1000, teamMembers: 5, storageMb: 5000, emailSyncsPerMonth: 50 },
      capabilities: ["ai.assistant"],
      activeAddonIds: [],
      billingInterval: "month",
      creditBalance: 1000,
      creditBalancePurchased: 0,
      creditBalanceSubscription: 1000,
      includedMonthlyCredits: 1000,
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
