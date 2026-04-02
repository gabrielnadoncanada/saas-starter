import { beforeEach, describe, expect, it, vi } from "vitest";

import { LimitReachedError } from "@/features/billing/errors/limit-reached";
import { UpgradeRequiredError } from "@/features/billing/errors/upgrade-required";

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

vi.mock("@/features/ai/server/organization-ai-settings", () => ({
  assertOrganizationAiAccess: vi.fn(),
}));

vi.mock("@/features/ai/server/resolve-model-selection", () => ({
  resolveOrganizationModelSelection: vi.fn(),
}));

vi.mock("@/shared/lib/ai/get-model-instance", () => ({
  getAiModelInstance: vi.fn(() => ({
    definition: { id: "gemini-2.5-flash" },
    model: { id: "assistant-model" },
  })),
}));

vi.mock("@/features/ai/server/ai-conversations", () => ({
  getAiConversation: vi.fn(),
}));

vi.mock("@/features/billing/usage/usage-service", () => ({
  consumeMonthlyUsage: vi.fn(),
}));

const { streamText } = await import("ai");
const { getCurrentUser } = await import("@/shared/lib/auth/get-current-user");
const { assertOrganizationAiAccess } =
  await import("@/features/ai/server/organization-ai-settings");
const { resolveOrganizationModelSelection } =
  await import("@/features/ai/server/resolve-model-selection");
const { getAiConversation } =
  await import("@/features/ai/server/ai-conversations");
const { consumeMonthlyUsage } =
  await import("@/features/billing/usage/usage-service");
const { POST } = await import("@/app/api/assistant/route");

describe("POST /api/assistant", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1" } as never);
    vi.mocked(assertOrganizationAiAccess).mockResolvedValue({
      planId: "pro",
      organizationId: "12",
      organizationName: "Acme",
      subscriptionStatus: "active",
      pricingModel: "flat",
    });
    vi.mocked(resolveOrganizationModelSelection).mockResolvedValue({
      model: {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        provider: "google",
        providerLabel: "Google",
      },
      defaultModelId: "gemini-2.5-flash",
      allowedModels: [],
    });
    vi.mocked(getAiConversation).mockResolvedValue(null);
    vi.mocked(consumeMonthlyUsage).mockResolvedValue(undefined);
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

  it("returns 403 when the plan does not include ai.assistant", async () => {
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

  it("returns 429 when the AI quota is exhausted", async () => {
    vi.mocked(consumeMonthlyUsage).mockRejectedValue(
      new LimitReachedError("aiRequestsPerMonth", 100, 100, "Pro"),
    );

    const response = await POST(
      new Request("http://localhost/api/assistant", {
        method: "POST",
        body: JSON.stringify({ messages: [] }),
      }),
    );

    expect(response.status).toBe(429);
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

  it("consumes AI usage before a successful streamed response", async () => {
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
    expect(consumeMonthlyUsage).toHaveBeenCalledWith(
      "12",
      "aiRequestsPerMonth",
      "pro",
    );
    expect(resolveOrganizationModelSelection).toHaveBeenCalledWith(
      "12",
      undefined,
    );
  });
});
