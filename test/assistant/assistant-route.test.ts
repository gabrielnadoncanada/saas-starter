import { beforeEach, describe, expect, it, vi } from "vitest";

import { LimitReachedError } from "@/features/billing/errors";

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

vi.mock("@/features/billing/guards", async () => {
  const actual =
    await vi.importActual<typeof import("@/features/billing/guards")>(
      "@/features/billing/guards",
    );

  return {
    ...actual,
    getTeamPlan: vi.fn(),
  };
});

vi.mock("@/features/billing/usage", () => ({
  consumeMonthlyUsage: vi.fn(),
}));

const { streamText } = await import("ai");
const { getCurrentUser } = await import("@/shared/lib/auth/get-current-user");
const { getTeamPlan } = await import("@/features/billing/guards");
const { consumeMonthlyUsage } = await import(
  "@/features/billing/usage"
);
const { POST } = await import("@/app/api/assistant/route");

describe("POST /api/assistant", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as never);
    vi.mocked(getTeamPlan).mockResolvedValue({
      planId: "pro",
      teamId: 12,
      teamName: "Acme",
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
    vi.mocked(getTeamPlan).mockResolvedValue({
      planId: "free",
      teamId: 12,
      teamName: "Acme",
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

  it("consumes AI usage before a successful streamed response", async () => {
    const response = await POST(
      new Request("http://localhost/api/assistant", {
        method: "POST",
        body: JSON.stringify({ messages: [] }),
      }),
    );

    expect(response.status).toBe(200);
    expect(streamText).toHaveBeenCalled();
    expect(consumeMonthlyUsage).toHaveBeenCalledWith(
      12,
      "aiRequestsPerMonth",
      "pro",
    );
  });
});
