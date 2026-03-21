import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CreateInvoiceDraftToolResult,
  CreateTaskToolResult,
  ReviewInboxToolResult,
} from "@/features/assistant/types";
import { LimitReachedError, UpgradeRequiredError } from "@/features/billing/errors";
import { getPlan } from "@/features/billing/plans";
import { getPlanLimit, hasCapability } from "@/features/billing/guards";

vi.mock("server-only", () => ({}));

vi.mock("ai", () => ({
  tool: <T>(definition: T) => definition,
}));

vi.mock("@/features/billing/guards/get-team-plan", () => ({
  getTeamPlan: vi.fn(),
}));

vi.mock("@/features/billing/guards", async () => {
  const actual =
    await vi.importActual<typeof import("@/features/billing/guards")>(
      "@/features/billing/guards",
    );

  return {
    ...actual,
    assertCapability: vi.fn((planId, capability) => {
      if (!hasCapability(planId, capability)) {
        throw new UpgradeRequiredError(capability, getPlan(planId).name);
      }
    }),
  };
});

vi.mock("@/features/billing/usage", () => ({
  consumeMonthlyUsage: vi.fn(),
}));

vi.mock("@/features/tasks/server/create-task-for-current-team", () => ({
  createTaskForCurrentTeam: vi.fn(),
}));

vi.mock("@/features/assistant/server/email-provider", () => ({
  emailProvider: {
    name: "Demo inbox",
    getRecentMessages: vi.fn(),
  },
}));

const { getTeamPlan } = await import("@/features/billing/guards/get-team-plan");
const { consumeMonthlyUsage } = await import(
  "@/features/billing/usage"
);
const { createTaskForCurrentTeam } = await import(
  "@/features/tasks/server/create-task-for-current-team"
);
const { emailProvider } = await import("@/features/assistant/server/email-provider");
const { assistantTools } = await import("@/features/assistant/server/tools");

const reviewInboxExecute = assistantTools.reviewInbox
  .execute as (input: { limit?: number }) => Promise<ReviewInboxToolResult>;
const createTaskExecute = assistantTools.createTask.execute as (input: {
  title: string;
  description?: string;
  label?: "FEATURE" | "BUG" | "DOCUMENTATION";
  priority?: "LOW" | "MEDIUM" | "HIGH";
}) => Promise<CreateTaskToolResult>;
const createInvoiceDraftExecute = assistantTools.createInvoiceDraft
  .execute as (input: {
  clientName: string;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
}) => Promise<CreateInvoiceDraftToolResult>;

describe("assistant tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTeamPlan).mockResolvedValue({
      planId: "pro",
      teamId: 12,
      teamName: "Acme",
      subscriptionStatus: "active",
      pricingModel: "flat",
    });
    vi.mocked(consumeMonthlyUsage).mockResolvedValue(undefined);
  });

  it("blocks reviewInbox when the plan does not include email.sync", async () => {
    vi.mocked(getTeamPlan).mockResolvedValue({
      planId: "free",
      teamId: 12,
      teamName: "Acme",
      subscriptionStatus: null,
      pricingModel: "flat",
    });

    const result = await reviewInboxExecute({ limit: 3 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("UPGRADE_REQUIRED");
    }
    expect(emailProvider.getRecentMessages).not.toHaveBeenCalled();
  });

  it("blocks reviewInbox when the email sync quota is exhausted", async () => {
    vi.mocked(consumeMonthlyUsage).mockRejectedValue(
      new LimitReachedError("emailSyncsPerMonth", 50, 50, "Pro"),
    );
    vi.mocked(emailProvider.getRecentMessages).mockResolvedValue([]);

    const result = await reviewInboxExecute({ limit: 3 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("LIMIT_REACHED");
    }
    expect(emailProvider.getRecentMessages).toHaveBeenCalledWith(3);
  });

  it("consumes email sync usage before a successful inbox review", async () => {
    vi.mocked(emailProvider.getRecentMessages).mockResolvedValue([
      {
        id: "msg-1",
        from: "billing@vendor.com",
        subject: "Invoice reminder",
        snippet: "Please review",
        receivedAt: "2026-03-17T10:00:00.000Z",
      },
    ]);

    const result = await reviewInboxExecute({ limit: 1 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.count).toBe(1);
      expect(result.result.provider).toBe("Demo inbox");
    }
    expect(consumeMonthlyUsage).toHaveBeenCalledWith(
      12,
      "emailSyncsPerMonth",
      "pro",
    );
  });

  it("creates tasks through the shared guarded task contract", async () => {
    vi.mocked(createTaskForCurrentTeam).mockResolvedValue({
      code: "TASK-52",
      title: "Follow up with client",
      status: "TODO",
    } as never);

    const result = await createTaskExecute({
      title: "Follow up with client",
      label: "FEATURE",
      priority: "HIGH",
    });

    expect(createTaskForCurrentTeam).toHaveBeenCalledWith({
      title: "Follow up with client",
      description: undefined,
      label: "FEATURE",
      priority: "HIGH",
    });
    expect(result.success).toBe(true);
  });

  it("blocks invoice drafts when the plan does not include invoice.create", async () => {
    vi.mocked(getTeamPlan).mockResolvedValue({
      planId: "free",
      teamId: 12,
      teamName: "Acme",
      subscriptionStatus: null,
      pricingModel: "flat",
    });

    const result = await createInvoiceDraftExecute({
      clientName: "Acme Corp",
      items: [{ description: "Consulting", quantity: 2, unitPrice: 150 }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("UPGRADE_REQUIRED");
    }
  });
});
