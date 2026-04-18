import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
  tool: <T>(definition: T) => definition,
}));

vi.mock("@/features/agents/server/public-conversations", () => ({
  setPublicConversationStatus: vi.fn(),
}));

vi.mock("@/features/knowledge/server/retrieve", () => ({
  retrieveRelevantChunks: vi.fn(),
}));

vi.mock("@/features/leads/server/lead-mutations", () => ({
  createLeadFromConversation: vi.fn(),
}));

const { setPublicConversationStatus } = await import(
  "@/features/agents/server/public-conversations"
);
const { retrieveRelevantChunks } = await import(
  "@/features/knowledge/server/retrieve"
);
const { createLeadFromConversation } = await import(
  "@/features/leads/server/lead-mutations"
);
const { buildPublicChatTools } = await import("@/features/agents/server/tools");

const ctx = {
  organizationId: "org_123",
  agentId: "agt_123",
  conversationId: "conv_123",
};

type ToolWithExecute = { execute: (input: unknown) => Promise<unknown> };

describe("buildPublicChatTools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("only exposes tools that are in the enabled list", () => {
    const tools = buildPublicChatTools(ctx, ["lookupKnowledge"]);
    expect(Object.keys(tools)).toEqual(["lookupKnowledge"]);
  });

  it("lookupKnowledge passes the org+agent context to the retriever", async () => {
    vi.mocked(retrieveRelevantChunks).mockResolvedValue([
      {
        content: "4mm, 6mm, 9mm, 12mm",
        documentTitle: "Specs",
        similarity: 0.9,
        rerankScore: 0.95,
      } as never,
    ]);

    const tools = buildPublicChatTools(ctx, ["lookupKnowledge"]);
    const tool = tools.lookupKnowledge as unknown as ToolWithExecute;
    const result = (await tool.execute({ query: "thickness", topK: 3 })) as {
      success: boolean;
      results: Array<{ content: string; title: string; score: number }>;
    };

    expect(retrieveRelevantChunks).toHaveBeenCalledWith({
      organizationId: "org_123",
      agentId: "agt_123",
      query: "thickness",
      topK: 3,
    });
    expect(result.success).toBe(true);
    expect(result.results[0].score).toBe(0.95);
  });

  it("createLead forwards qualification data to the lead mutation", async () => {
    vi.mocked(createLeadFromConversation).mockResolvedValue({
      id: "lead_123",
    } as never);

    const tools = buildPublicChatTools(ctx, ["createLead"]);
    const tool = tools.createLead as unknown as ToolWithExecute;
    const result = (await tool.execute({
      data: { need: "custom cabinet", thickness: "18mm" },
      contactEmail: "jane@example.com",
      contactName: "Jane",
      score: 80,
    })) as { success: boolean; leadId: string };

    expect(createLeadFromConversation).toHaveBeenCalledWith({
      organizationId: "org_123",
      conversationId: "conv_123",
      data: { need: "custom cabinet", thickness: "18mm" },
      score: 80,
      contactEmail: "jane@example.com",
      contactName: "Jane",
      contactPhone: null,
      notes: null,
    });
    expect(result).toEqual(
      expect.objectContaining({ success: true, leadId: "lead_123" }),
    );
  });

  it("requestHuman flips the conversation to WAITING_HUMAN", async () => {
    vi.mocked(setPublicConversationStatus).mockResolvedValue(
      undefined as never,
    );

    const tools = buildPublicChatTools(ctx, ["requestHuman"]);
    const tool = tools.requestHuman as unknown as ToolWithExecute;
    const result = (await tool.execute({
      reason: "user wants a quote",
    })) as { success: boolean; message: string };

    expect(setPublicConversationStatus).toHaveBeenCalledWith({
      organizationId: "org_123",
      conversationId: "conv_123",
      status: "WAITING_HUMAN",
    });
    expect(result.success).toBe(true);
    expect(result.message).toContain("user wants a quote");
  });

  it("scheduleCallback refuses without any contact info", async () => {
    const tools = buildPublicChatTools(ctx, ["scheduleCallback"]);
    const tool = tools.scheduleCallback as unknown as ToolWithExecute;
    const result = (await tool.execute({
      contactName: "Jane",
    })) as { success: boolean; error?: { code: string } };

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("MISSING_CONTACT");
    expect(createLeadFromConversation).not.toHaveBeenCalled();
  });

  it("scheduleCallback creates a lead and marks the conversation WAITING_HUMAN", async () => {
    vi.mocked(createLeadFromConversation).mockResolvedValue({
      id: "lead_cb",
    } as never);
    vi.mocked(setPublicConversationStatus).mockResolvedValue(
      undefined as never,
    );

    const tools = buildPublicChatTools(ctx, ["scheduleCallback"]);
    const tool = tools.scheduleCallback as unknown as ToolWithExecute;
    const result = (await tool.execute({
      contactName: "Jane",
      contactEmail: "jane@example.com",
      preferredTime: "tomorrow 2pm",
      topic: "specs",
    })) as { success: boolean; leadId: string };

    expect(createLeadFromConversation).toHaveBeenCalled();
    expect(setPublicConversationStatus).toHaveBeenCalledWith({
      organizationId: "org_123",
      conversationId: "conv_123",
      status: "WAITING_HUMAN",
    });
    expect(result).toEqual({ success: true, leadId: "lead_cb" });
  });
});
