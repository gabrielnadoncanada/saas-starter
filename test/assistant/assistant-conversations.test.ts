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
const { assistantConversationSurface } =
  await import("@/features/assistant/types");
const {
  createAssistantConversation,
  deleteAssistantConversation,
  listAssistantConversations,
} = await import("@/features/assistant/server/assistant-conversations");
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
      title: "Create a high-priority task to follow up with Acme Corp.",
      messagesJson: [
        {
          id: "m1",
          role: "user",
          parts: [
            {
              type: "text",
              text: "Create a high-priority task to follow up with Acme Corp.",
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
            text: "   Create   a high-priority task to follow up with Acme Corp.   ",
          },
        ],
      },
    ]);

    expect(db.aiConversation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: "19",
          createdByUserId: "7",
          surface: assistantConversationSurface,
          title: "Create a high-priority task to follow up with Acme Corp.",
        }),
      }),
    );
    expect(conversation).toEqual(
      expect.objectContaining({
        id: "conv_1",
        surface: assistantConversationSurface,
        title: "Create a high-priority task to follow up with Acme Corp.",
        preview: "Create a high-priority task to follow up with Acme Corp.",
      }),
    );
  });

  it("lists conversations inside the current assistant scope", async () => {
    vi.mocked(db.aiConversation.findMany).mockResolvedValue([
      {
        id: "conv_1",
        title: "Tasks",
        messagesJson: [
          {
            id: "m1",
            role: "assistant",
            parts: [{ type: "text", text: "Created task TASK-1 for you." }],
          },
        ],
        lastMessageAt: new Date("2026-03-17T13:00:00.000Z"),
      },
    ] as never);

    const conversations = await listAssistantConversations();

    expect(db.aiConversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: "19",
          createdByUserId: "7",
          surface: assistantConversationSurface,
        },
      }),
    );
    expect(conversations).toEqual([
      {
        id: "conv_1",
        surface: assistantConversationSurface,
        title: "Tasks",
        preview: "Created task TASK-1 for you.",
        lastMessageAt: "2026-03-17T13:00:00.000Z",
      },
    ]);
  });

  it("deletes conversations only inside the current assistant scope", async () => {
    vi.mocked(db.aiConversation.deleteMany).mockResolvedValue({
      count: 1,
    } as never);

    const deleted = await deleteAssistantConversation("conv_1");

    expect(db.aiConversation.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "conv_1",
        organizationId: "19",
        createdByUserId: "7",
        surface: assistantConversationSurface,
      },
    });
    expect(deleted).toBe(true);
  });
});
