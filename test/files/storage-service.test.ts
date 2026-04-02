import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/features/billing/guards/get-organization-plan", () => ({
  getOrganizationPlan: vi.fn(),
}));

vi.mock("@/features/billing/guards/plan-guards", () => ({
  getPlanLimit: vi.fn(),
}));

vi.mock("@/shared/lib/storage/storage", () => ({
  getFileStorage: vi.fn(),
}));

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {
    storedFile: {
      aggregate: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

const { saveStoredFile, deleteStoredFile, readStoredFileBody } = await import(
  "@/features/files/server/storage-service"
);
const { getOrganizationPlan } = await import(
  "@/features/billing/guards/get-organization-plan"
);
const { getPlanLimit } = await import("@/features/billing/guards/plan-guards");
const { getFileStorage } = await import("@/shared/lib/storage/storage");
const { db } = await import("@/shared/lib/db/prisma");

describe("storage-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getOrganizationPlan).mockResolvedValue({
      organizationId: "org_123",
      planId: "pro",
    } as never);
    vi.mocked(getPlanLimit).mockReturnValue(5);
    vi.mocked(db.storedFile.aggregate).mockResolvedValue({
      _sum: { sizeBytes: 1024 },
    } as never);
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
    vi.mocked(db.storedFile.delete).mockResolvedValue({ id: "file_123" } as never);
  });

  it("stores a file when the organization has remaining quota", async () => {
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

  it("rejects uploads that exceed the plan storage limit", async () => {
    vi.mocked(getPlanLimit).mockReturnValue(0.000001);
    const file = new File(["hello world"], "spec.txt", { type: "text/plain" });

    await expect(
      saveStoredFile({
        organizationId: "org_123",
        uploadedByUserId: "user_123",
        file,
      }),
    ).rejects.toThrow("Storage limit reached for the current plan.");

    expect(db.storedFile.create).not.toHaveBeenCalled();
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
