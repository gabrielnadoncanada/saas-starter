import { beforeEach, describe, expect, it, vi } from "vitest";

import { LimitReachedError } from "@/features/billing/errors/limit-reached";

vi.mock("server-only", () => ({}));

vi.mock("ai", () => ({
  convertToModelMessages: vi.fn(async (messages) => messages),
  stepCountIs: vi.fn(() => "stop"),
  streamText: vi.fn(({ onFinish }) => {
    void onFinish?.();

    return {
      toUIMessageStreamResponse: () => new Response("ok", { status: 200 }),
    };
  }),
}));

vi.mock("@/features/assistant/server/get-assistant-model", () => ({
  getAssistantModel: vi.fn(() => ({
    provider: "google",
    modelId: "gemini-2.5-flash",
    model: { id: "assistant-model" },
  })),
}));

vi.mock("@/features/assistant/server/tools", () => ({
  assistantTools: {},
}));

vi.mock("@/shared/lib/auth/get-current-user", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/features/billing/guards/get-organization-plan", () => ({
  getOrganizationPlan: vi.fn(),
}));

vi.mock("@/features/billing/usage/usage-service", () => ({
  consumeMonthlyUsage: vi.fn(),
}));

const { streamText } = await import("ai");
const { getCurrentUser } = await import("@/shared/lib/auth/get-current-user");
const { getOrganizationPlan } = await import("@/features/billing/guards/get-organization-plan");
const { consumeMonthlyUsage } = await import(
  "@/features/billing/usage/usage-service"
);
const { POST } = await import("@/app/api/assistant/route");

describe("POST /api/assistant", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1" } as never);
    vi.mocked(getOrganizationPlan).mockResolvedValue({
      planId: "pro",
      organizationId: "12",
      organizationName: "Acme",
      subscriptionStatus: "active",
      pricingModel: "flat",
    });
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
    vi.mocked(getOrganizationPlan).mockResolvedValue({
      planId: "free",
      organizationId: "12",
      organizationName: "Acme",
      subscriptionStatus: null,
      pricingModel: "flat",
    });

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

  it("consumes AI usage before a successful streamed response", async () => {
    const response = await POST(
      new Request("http://localhost/api/assistant", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "Hello" }] }],
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
  });
});

