import { beforeEach, describe, expect, it, vi } from "vitest";

import { UpgradeRequiredError } from "@/features/billing/billing-errors";

vi.mock("server-only", () => ({}));

vi.mock("ai", () => ({
  convertToModelMessages: vi.fn(async (messages) => messages),
  stepCountIs: vi.fn(() => "stop"),
  tool: <T>(definition: T) => definition,
  streamText: vi.fn(() => ({
    toUIMessageStreamResponse: () => new Response("ok", { status: 200 }),
  })),
}));

vi.mock("@/shared/lib/auth/get-current-user", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/features/assistant/server/organization-ai-access", () => ({
  assertOrganizationAiAccess: vi.fn(),
}));

vi.mock("@/features/assistant/server/assistant-model-selection", () => {
  class MockAssistantModelSelectionError extends Error {
    code = "UNKNOWN_MODEL" as const;

    constructor(message: string) {
      super(message);
    }
  }

  return {
    AssistantModelSelectionError: MockAssistantModelSelectionError,
    resolveOrganizationAssistantModelSelection: vi.fn(),
  };
});

vi.mock("@/shared/lib/ai/get-model-instance", () => ({
  getAiModelInstance: vi.fn(() => ({
    definition: { id: "gemini-2.5-flash" },
    model: { id: "assistant-model" },
  })),
}));

vi.mock("@/features/assistant/server/assistant-conversations", () => ({
  getAssistantConversation: vi.fn(),
}));

const { streamText } = await import("ai");
const { getCurrentUser } = await import("@/shared/lib/auth/get-current-user");
const { assertOrganizationAiAccess } =
  await import("@/features/assistant/server/organization-ai-access");
const { resolveOrganizationAssistantModelSelection } =
  await import("@/features/assistant/server/assistant-model-selection");
const { getAssistantConversation } =
  await import("@/features/assistant/server/assistant-conversations");
const { POST } = await import("@/app/api/assistant/route");

describe("POST /api/assistant", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1" } as never);
    vi.mocked(assertOrganizationAiAccess).mockResolvedValue({
      organizationId: "12",
      planId: "pro",
      planName: "Pro",
      limits: { tasksPerMonth: 1000, teamMembers: 5, storageMb: 5000 },
      capabilities: ["ai.assistant"],
      billingInterval: "month",
      oneTimeProductIds: [],
      pricingModel: "flat",
      seats: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "active",
    } as never);
    vi.mocked(resolveOrganizationAssistantModelSelection).mockResolvedValue({
      model: {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        provider: "google",
        providerLabel: "Google",
      },
      defaultModelId: "gemini-2.5-flash",
      allowedModels: [],
    });
    vi.mocked(getAssistantConversation).mockResolvedValue(null);
  });

  it("returns 401 when the user is not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/assistant", {
        method: "POST",
        body: JSON.stringify({ messages: [] }),
      }),
    );

    expect(response.status).toBe(401);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("returns 403 when the workspace does not include ai.assistant", async () => {
    vi.mocked(assertOrganizationAiAccess).mockRejectedValue(
      new UpgradeRequiredError("ai.assistant", "Free"),
    );

    const response = await POST(
      new Request("http://localhost/api/assistant", {
        method: "POST",
        body: JSON.stringify({ messages: [] }),
      }),
    );

    expect(response.status).toBe(403);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("returns 400 when messages are missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/assistant", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("returns 404 when the conversation does not exist", async () => {
    const response = await POST(
      new Request("http://localhost/api/assistant", {
        method: "POST",
        body: JSON.stringify({
          conversationId: "missing",
          messages: [
            { id: "1", role: "user", parts: [{ type: "text", text: "Hello" }] },
          ],
        }),
      }),
    );

    expect(response.status).toBe(404);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("streams a successful response when access checks pass", async () => {
    const response = await POST(
      new Request("http://localhost/api/assistant", {
        method: "POST",
        body: JSON.stringify({
          messages: [
            { id: "1", role: "user", parts: [{ type: "text", text: "Hello" }] },
          ],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(streamText).toHaveBeenCalled();
    expect(resolveOrganizationAssistantModelSelection).toHaveBeenCalledWith(
      "12",
      undefined,
    );
  });
});
