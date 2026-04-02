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
    aiConversation: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const { getCurrentUser } = await import("@/shared/lib/auth/get-current-user");
const { getCurrentOrganization } =
  await import("@/features/organizations/server/current-organization");
const { aiConversationSurfaces } = await import("@/features/ai/ai-surfaces");
const {
  createAiConversation,
  deleteAiConversation,
  listAiConversations,
} = await import("@/features/ai/server/ai-conversations");
const { db } = await import("@/shared/lib/db/prisma");

describe("ai conversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getCurrentUser).mockResolvedValue({ id: "7" } as never);
    vi.mocked(getCurrentOrganization).mockResolvedValue({ id: "19" } as never);
  });

  it("creates a scoped assistant conversation with a generated title", async () => {
    vi.mocked(db.aiConversation.create).mockResolvedValue({
      id: "conv_1",
      surface: aiConversationSurfaces.assistant,
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

    const conversation = await createAiConversation(
      aiConversationSurfaces.assistant,
      [
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
      ],
    );

    expect(db.aiConversation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: "19",
          createdByUserId: "7",
          surface: aiConversationSurfaces.assistant,
          title: "Draft an invoice for Acme Corp due next week.",
        }),
      }),
    );
    expect(conversation).toEqual(
      expect.objectContaining({
        id: "conv_1",
        surface: aiConversationSurfaces.assistant,
        title: "Draft an invoice for Acme Corp due next week.",
        preview: "Draft an invoice for Acme Corp due next week.",
      }),
    );
  });

  it("lists conversations inside the current assistant scope", async () => {
    vi.mocked(db.aiConversation.findMany).mockResolvedValue([
      {
        id: "conv_1",
        surface: aiConversationSurfaces.assistant,
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

    const conversations = await listAiConversations(
      aiConversationSurfaces.assistant,
    );

    expect(db.aiConversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: "19",
          createdByUserId: "7",
          surface: aiConversationSurfaces.assistant,
        },
      }),
    );
    expect(conversations).toEqual([
      {
        id: "conv_1",
        surface: aiConversationSurfaces.assistant,
        title: "Invoice",
        preview: "Invoice ready for review.",
        lastMessageAt: "2026-03-17T13:00:00.000Z",
      },
    ]);
  });

  it("deletes conversations only inside the current assistant scope", async () => {
    vi.mocked(db.aiConversation.deleteMany).mockResolvedValue({
      count: 1,
    } as never);

    const deleted = await deleteAiConversation(
      "conv_1",
      aiConversationSurfaces.assistant,
    );

    expect(db.aiConversation.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "conv_1",
        organizationId: "19",
        createdByUserId: "7",
        surface: aiConversationSurfaces.assistant,
      },
    });
    expect(deleted).toBe(true);
  });
});
