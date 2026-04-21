import { mkdir } from "node:fs/promises";
import path from "node:path";

import { createStorage, type Storage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import s3Driver from "unstorage/drivers/s3";

type S3Env = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};

function readS3Env(): S3Env | null {
  const {
    STORAGE_S3_ENDPOINT: endpoint,
    STORAGE_S3_BUCKET: bucket,
    STORAGE_S3_ACCESS_KEY_ID: accessKeyId,
    STORAGE_S3_SECRET_ACCESS_KEY: secretAccessKey,
    STORAGE_S3_REGION: region,
  } = process.env;

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey || !region) {
    return null;
  }

  return { endpoint, bucket, accessKeyId, secretAccessKey, region };
}

async function createFsStorage(): Promise<Storage> {
  const base = path.join(process.cwd(), ".storage");
  await mkdir(base, { recursive: true });
  return createStorage({ driver: fsDriver({ base }) });
}

function createS3Storage(env: S3Env): Storage {
  return createStorage({ driver: s3Driver(env) });
}

let storagePromise: Promise<Storage> | null = null;

export function getFileStorage(): Promise<Storage> {
  if (!storagePromise) {
    const s3Env = readS3Env();
    storagePromise = s3Env
      ? Promise.resolve(createS3Storage(s3Env))
      : createFsStorage();
  }

  return storagePromise;
}
