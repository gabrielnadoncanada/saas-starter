import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/shared/lib/auth/get-current-user", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/features/organizations/server/current-organization", () => ({
  getCurrentOrganization: vi.fn(),
}));

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {
    assistantConversation: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const { getCurrentUser } = await import("@/shared/lib/auth/get-current-user");
const { getCurrentOrganization } = await import(
  "@/features/organizations/server/current-organization"
);
const {
  createAssistantConversation,
  deleteAssistantConversation,
  listAssistantConversations,
} = await import("@/features/assistant/server/conversations");
const { db } = await import("@/shared/lib/db/prisma");

describe("assistant conversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getCurrentUser).mockResolvedValue({ id: "7" } as never);
    vi.mocked(getCurrentOrganization).mockResolvedValue({ id: "19" } as never);
  });

  it("creates a scoped conversation with a generated title", async () => {
    vi.mocked(db.assistantConversation.create).mockResolvedValue({
      id: "conv_1",
      title: "Draft an invoice for Acme Corp due next week.",
      messagesJson: [
        {
          id: "m1",
          role: "user",
          parts: [
            {
              type: "text",
              text: "Draft an invoice for Acme Corp due next week.",
            },
          ],
        },
      ],
      lastMessageAt: new Date("2026-03-17T12:00:00.000Z"),
    } as never);

    const conversation = await createAssistantConversation([
      {
        id: "m1",
        role: "user",
        parts: [
          {
            type: "text",
            text: "   Draft   an invoice for Acme Corp due next week.   ",
          },
        ],
      },
    ]);

    expect(db.assistantConversation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: "19",
          userId: "7",
          title: "Draft an invoice for Acme Corp due next week.",
        }),
      })
    );
    expect(conversation).toEqual(
      expect.objectContaining({
        id: "conv_1",
        title: "Draft an invoice for Acme Corp due next week.",
        preview: "Draft an invoice for Acme Corp due next week.",
      })
    );
  });

  it("maps recent conversations with a text preview", async () => {
    vi.mocked(db.assistantConversation.findMany).mockResolvedValue([
      {
        id: "conv_1",
        title: "Invoice",
        messagesJson: [
          {
            id: "m1",
            role: "assistant",
            parts: [{ type: "text", text: "Invoice ready for review." }],
          },
        ],
        lastMessageAt: new Date("2026-03-17T13:00:00.000Z"),
      },
    ] as never);

    const conversations = await listAssistantConversations();

    expect(db.assistantConversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: "19", userId: "7" },
      })
    );
    expect(conversations).toEqual([
      {
        id: "conv_1",
        title: "Invoice",
        preview: "Invoice ready for review.",
        lastMessageAt: "2026-03-17T13:00:00.000Z",
      },
    ]);
  });

  it("deletes conversations only inside the current user and organization scope", async () => {
    vi.mocked(db.assistantConversation.deleteMany).mockResolvedValue({
      count: 1,
    } as never);

    const deleted = await deleteAssistantConversation("conv_1");

    expect(db.assistantConversation.deleteMany).toHaveBeenCalledWith({
      where: { id: "conv_1", organizationId: "19", userId: "7" },
    });
    expect(deleted).toBe(true);
  });
});

