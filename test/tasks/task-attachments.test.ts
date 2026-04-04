import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/features/organizations/server/organization-membership", () => ({
  requireActiveOrganizationMembership: vi.fn(),
}));

vi.mock("@/features/storage/server/storage-service", () => ({
  saveStoredFile: vi.fn(),
  deleteStoredFile: vi.fn(),
}));

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {
    task: {
      findFirst: vi.fn(),
    },
    taskAttachment: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const {
  createTaskAttachment,
  listTaskAttachments,
  removeTaskAttachment,
} = await import("@/features/tasks/server/task-attachments");
const { requireActiveOrganizationMembership } = await import(
  "@/features/organizations/server/organization-membership"
);
const { saveStoredFile, deleteStoredFile } = await import(
  "@/features/storage/server/storage-service"
);
const { db } = await import("@/shared/lib/db/prisma");

describe("task-attachments", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(requireActiveOrganizationMembership).mockResolvedValue({
      organizationId: "org_123",
    } as never);
    vi.mocked(db.task.findFirst).mockResolvedValue({ id: 42 } as never);
    vi.mocked(saveStoredFile).mockResolvedValue({
      id: "file_123",
    } as never);
    vi.mocked(db.taskAttachment.create).mockResolvedValue({
      id: "attachment_123",
      taskId: 42,
      storedFileId: "file_123",
      storedFile: {
        id: "file_123",
        fileName: "spec.pdf",
        contentType: "application/pdf",
        sizeBytes: 1024,
        createdAt: new Date(),
      },
    } as never);
    vi.mocked(db.taskAttachment.findFirst).mockResolvedValue({
      id: "attachment_123",
      taskId: 42,
      storedFileId: "file_123",
      storedFile: {
        id: "file_123",
        fileName: "spec.pdf",
        contentType: "application/pdf",
        sizeBytes: 1024,
        createdAt: new Date(),
      },
    } as never);
    vi.mocked(db.taskAttachment.findMany).mockResolvedValue([] as never);
  });

  it("lists attachments for the active organization only", async () => {
    await listTaskAttachments(42);

    expect(db.taskAttachment.findMany).toHaveBeenCalledWith({
      where: {
        taskId: 42,
        task: {
          organizationId: "org_123",
        },
      },
      orderBy: { createdAt: "desc" },
      include: expect.any(Object),
    });
  });

  it("creates a task attachment after validating the file", async () => {
    const file = new File(["pdf"], "spec.pdf", { type: "application/pdf" });

    const attachment = await createTaskAttachment(42, file, "user_123");

    expect(saveStoredFile).toHaveBeenCalledWith({
      organizationId: "org_123",
      uploadedByUserId: "user_123",
      file,
    });
    expect(attachment.id).toBe("attachment_123");
  });

  it("rejects unsupported attachment types", async () => {
    const file = new File(["bad"], "script.exe", {
      type: "application/x-msdownload",
    });

    await expect(createTaskAttachment(42, file, "user_123")).rejects.toThrow(
      "This file type is not supported.",
    );

    expect(saveStoredFile).not.toHaveBeenCalled();
  });

  it("deletes the backing stored file when an attachment is removed", async () => {
    const attachment = await removeTaskAttachment("attachment_123");

    expect(deleteStoredFile).toHaveBeenCalledWith("file_123", "org_123");
    expect(attachment.id).toBe("attachment_123");
  });
});
