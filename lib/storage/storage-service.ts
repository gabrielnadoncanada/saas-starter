import "server-only";

import { randomUUID } from "node:crypto";
import path from "node:path";

import { db } from "@/lib/db/prisma";
import { getFileStorage } from "@/lib/storage/storage";

function buildStorageKey(organizationId: string, fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  const baseName = path
    .basename(fileName, extension)
    .replace(/[^a-z0-9-_]+/gi, "-");

  return `${organizationId}/${randomUUID()}-${baseName}${extension}`;
}

export async function getStoredFileRecord(
  storedFileId: string,
  organizationId: string,
) {
  return db.storedFile.findFirst({
    where: {
      id: storedFileId,
      organizationId,
    },
  });
}

export async function readStoredFileBody(storageKey: string) {
  const storage = await getFileStorage();
  const body = await storage.getItemRaw(storageKey);

  if (!body) {
    throw new Error("Stored file is missing from backing storage.");
  }

  if (body instanceof Uint8Array) {
    return body;
  }

  if (typeof body === "string") {
    return Buffer.from(body);
  }

  return Buffer.from(body as ArrayBuffer);
}

export async function saveStoredFile(input: {
  organizationId: string;
  uploadedByUserId: string;
  file: File;
}) {
  const sizeBytes = input.file.size;
  const storageKey = buildStorageKey(input.organizationId, input.file.name);
  const storage = await getFileStorage();
  const buffer = Buffer.from(await input.file.arrayBuffer());

  await storage.setItemRaw(storageKey, buffer);

  return db.storedFile.create({
    data: {
      organizationId: input.organizationId,
      uploadedByUserId: input.uploadedByUserId,
      storageKey,
      fileName: input.file.name,
      contentType: input.file.type || "application/octet-stream",
      sizeBytes,
    },
  });
}

export async function deleteStoredFile(
  storedFileId: string,
  organizationId: string,
) {
  const storedFile = await getStoredFileRecord(storedFileId, organizationId);

  if (!storedFile) {
    throw new Error("File not found");
  }

  const storage = await getFileStorage();
  await storage.removeItem(storedFile.storageKey);

  await db.storedFile.delete({
    where: { id: storedFile.id },
  });
}
