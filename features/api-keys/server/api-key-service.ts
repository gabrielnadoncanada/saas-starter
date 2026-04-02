import "server-only";

import { db } from "@/shared/lib/db/prisma";

import {
  buildApiKeyPrefix,
  generateApiKeySecret,
  hashApiKey,
} from "@/features/api-keys/server/api-key-secret";

type CreateApiKeyInput = {
  organizationId: string;
  createdByUserId: string;
  name: string;
  capabilities: string[];
};

export async function listOrganizationApiKeys(organizationId: string) {
  return db.apiKey.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOrganizationApiKey(input: CreateApiKeyInput) {
  const secret = generateApiKeySecret();

  const apiKey = await db.apiKey.create({
    data: {
      organizationId: input.organizationId,
      createdByUserId: input.createdByUserId,
      name: input.name,
      prefix: buildApiKeyPrefix(secret),
      hashedKey: hashApiKey(secret),
      capabilities: input.capabilities,
    },
  });

  return {
    apiKey,
    secret,
  };
}

export async function revokeOrganizationApiKey(
  organizationId: string,
  apiKeyId: string,
) {
  return db.apiKey.updateMany({
    where: {
      id: apiKeyId,
      organizationId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function authenticateApiKey(secret: string) {
  const apiKey = await db.apiKey.findUnique({
    where: {
      hashedKey: hashApiKey(secret),
    },
  });

  if (!apiKey || apiKey.revokedAt) {
    return null;
  }

  await db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey;
}
