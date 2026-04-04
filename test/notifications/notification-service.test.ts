import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {
    notification: {
      count: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

const { db } = await import("@/shared/lib/db/prisma");
const {
  createNotification,
  createNotificationsForUsers,
  getUnreadNotificationCount,
  listUserNotifications,
  markAllNotificationsAsRead,
} = await import("@/features/notifications/server/notification-service");

describe("notification-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates notifications with optional metadata", async () => {
    await createNotification({
      organizationId: "org_1",
      userId: "user_1",
      type: "task.created",
      title: "Task created",
      body: "Created TASK-1",
      metadata: { taskId: 1 },
    });

    expect(db.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org_1",
        userId: "user_1",
        metadataJson: { taskId: 1 },
      }),
    });
  });

  it("creates many notifications only when there are recipients", async () => {
    await createNotificationsForUsers("org_1", [], {
      type: "task.created",
      title: "Task created",
      body: "Created TASK-1",
    });

    expect(db.notification.createMany).not.toHaveBeenCalled();

    await createNotificationsForUsers("org_1", ["user_1", "user_2"], {
      type: "task.created",
      title: "Task created",
      body: "Created TASK-1",
    });

    expect(db.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ organizationId: "org_1", userId: "user_1" }),
        expect.objectContaining({ organizationId: "org_1", userId: "user_2" }),
      ],
    });
  });

  it("lists unread counts and marks all as read for one user", async () => {
    await listUserNotifications("user_1", 10);
    await getUnreadNotificationCount("user_1");
    await markAllNotificationsAsRead("user_1");

    expect(db.notification.findMany).toHaveBeenCalledWith({
      where: { userId: "user_1" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    expect(db.notification.count).toHaveBeenCalledWith({
      where: {
        userId: "user_1",
        readAt: null,
      },
    });
    expect(db.notification.updateMany).toHaveBeenCalledWith({
      where: {
        userId: "user_1",
        readAt: null,
      },
      data: {
        readAt: expect.any(Date),
      },
    });
  });
});
