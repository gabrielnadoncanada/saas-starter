import { mkdir } from "node:fs/promises";
import path from "node:path";

import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import s3Driver from "unstorage/drivers/s3";

function shouldUseS3Storage() {
  return Boolean(
    process.env.STORAGE_S3_ENDPOINT &&
      process.env.STORAGE_S3_BUCKET &&
      process.env.STORAGE_S3_ACCESS_KEY_ID &&
      process.env.STORAGE_S3_SECRET_ACCESS_KEY &&
      process.env.STORAGE_S3_REGION,
  );
}

async function ensureLocalStorageBase() {
  const basePath = path.join(process.cwd(), ".storage");
  await mkdir(basePath, { recursive: true });
  return basePath;
}

function createS3Storage() {
  return createStorage({
    driver: s3Driver({
      endpoint: process.env.STORAGE_S3_ENDPOINT!,
      bucket: process.env.STORAGE_S3_BUCKET!,
      accessKeyId: process.env.STORAGE_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_S3_SECRET_ACCESS_KEY!,
      region: process.env.STORAGE_S3_REGION!,
    }),
  });
}

async function createFsStorage() {
  const base = await ensureLocalStorageBase();

  return createStorage({
    driver: fsDriver({ base }),
  });
}

let storagePromise: Promise<ReturnType<typeof createS3Storage>> | null = null;

export function getFileStorage() {
  if (!storagePromise) {
    storagePromise = Promise.resolve(
      shouldUseS3Storage() ? createS3Storage() : createFsStorage(),
    );
  }

  return storagePromise;
}
