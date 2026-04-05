import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/features/billing/server/organization-entitlements", () => ({
  getCurrentOrganizationEntitlements: vi.fn(),
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
  "@/features/storage/server/storage-service"
);
const { getCurrentOrganizationEntitlements } = await import(
  "@/features/billing/server/organization-entitlements"
);
const { getFileStorage } = await import("@/shared/lib/storage/storage");
const { db } = await import("@/shared/lib/db/prisma");

describe("storage-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getCurrentOrganizationEntitlements).mockResolvedValue({
      organizationId: "org_123",
      planId: "pro",
      planName: "Pro",
      limits: { tasksPerMonth: 1000, teamMembers: 5, storageMb: 5 },
      capabilities: ["task.create"],
      billingInterval: "month",
      oneTimeProductIds: [],
      pricingModel: "flat",
      seats: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "active",
    } as never);
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

  it("rejects uploads that exceed the storage limit", async () => {
    vi.mocked(getCurrentOrganizationEntitlements).mockResolvedValue({
      organizationId: "org_123",
      planId: "pro",
      planName: "Pro",
      limits: { tasksPerMonth: 1000, teamMembers: 5, storageMb: 0.000001 },
      capabilities: ["task.create"],
      billingInterval: "month",
      oneTimeProductIds: [],
      pricingModel: "flat",
      seats: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "active",
    } as never);

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
