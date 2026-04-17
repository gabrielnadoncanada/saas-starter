import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/storage/storage", () => ({
  getFileStorage: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  db: {
    storedFile: {
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

const { saveStoredFile, deleteStoredFile, readStoredFileBody } =
  await import("@/lib/storage/storage-service");
const { getFileStorage } = await import("@/lib/storage/storage");
const { db } = await import("@/lib/db/prisma");

describe("storage-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFileStorage).mockResolvedValue({
      setItemRaw: vi.fn(),
      getItemRaw: vi.fn(),
      removeItem: vi.fn(),
    } as never);
    vi.mocked(db.storedFile.create).mockResolvedValue({
      id: "file_123",
      storageKey: "org_123/file_123.txt",
    } as never);
    vi.mocked(db.storedFile.findFirst).mockResolvedValue({
      id: "file_123",
      storageKey: "org_123/file_123.txt",
    } as never);
    vi.mocked(db.storedFile.delete).mockResolvedValue({
      id: "file_123",
    } as never);
  });

  it("stores a file and creates a record", async () => {
    const storage = await getFileStorage();
    const file = new File(["hello"], "spec.txt", { type: "text/plain" });

    await saveStoredFile({
      organizationId: "org_123",
      uploadedByUserId: "user_123",
      file,
    });

    expect(storage.setItemRaw).toHaveBeenCalled();
    expect(db.storedFile.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org_123",
        uploadedByUserId: "user_123",
        fileName: "spec.txt",
        contentType: "text/plain",
        sizeBytes: file.size,
      }),
    });
  });

  it("deletes both the backing object and the database row", async () => {
    const storage = await getFileStorage();

    await deleteStoredFile("file_123", "org_123");

    expect(storage.removeItem).toHaveBeenCalledWith("org_123/file_123.txt");
    expect(db.storedFile.delete).toHaveBeenCalledWith({
      where: { id: "file_123" },
    });
  });

  it("normalizes string file bodies when reading from storage", async () => {
    const storage = await getFileStorage();
    vi.mocked(storage.getItemRaw).mockResolvedValue("hello" as never);

    const body = await readStoredFileBody("org_123/file_123.txt");

    expect(body.toString()).toBe("hello");
  });
});
