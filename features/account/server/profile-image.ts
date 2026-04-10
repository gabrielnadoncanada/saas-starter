import "server-only";

import { getFileStorage } from "@/shared/lib/storage/storage";
import { isPlatformAdmin } from "@/shared/lib/auth/roles";
import { db } from "@/shared/lib/db/prisma";

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

const avatarTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

const avatarExtensions = Object.values(avatarTypes);

function normalizeStorageBody(body: unknown) {
  if (body instanceof Uint8Array) {
    return body;
  }

  if (typeof body === "string") {
    return Buffer.from(body);
  }

  return Buffer.from(body as ArrayBuffer);
}

function getAvatarStorageKey(userId: string, extension: string) {
  return `avatars/${userId}${extension}`;
}

function getAvatarContentType(storageKey: string) {
  const extension = avatarExtensions.find((value) =>
    storageKey.endsWith(value),
  );

  if (!extension) {
    return "application/octet-stream";
  }

  const matchedType = Object.entries(avatarTypes).find(
    ([, value]) => value === extension,
  );

  return matchedType?.[0] ?? "application/octet-stream";
}

function getAvatarExtension(file: File) {
  const extension = avatarTypes[file.type as keyof typeof avatarTypes];

  if (!extension) {
    throw new Error("Avatar must be a PNG, JPG, or WebP image.");
  }

  return extension;
}

export function shouldSaveAvatar(file: File | null) {
  return Boolean(file && file.size > 0 && file.name);
}

async function deleteUserAvatarVariants(
  userId: string,
  keepExtension?: string,
) {
  const storage = await getFileStorage();

  await Promise.all(
    avatarExtensions
      .filter((extension) => extension !== keepExtension)
      .map((extension) =>
        storage.removeItem(getAvatarStorageKey(userId, extension)),
      ),
  );
}

export async function deleteUserAvatar(userId: string) {
  await deleteUserAvatarVariants(userId);
}

export async function saveUserAvatar(input: { userId: string; file: File }) {
  if (input.file.size > AVATAR_MAX_BYTES) {
    throw new Error("Avatar must be 2 MB or smaller.");
  }

  const extension = getAvatarExtension(input.file);
  const storage = await getFileStorage();
  const storageKey = getAvatarStorageKey(input.userId, extension);

  await storage.setItemRaw(
    storageKey,
    Buffer.from(await input.file.arrayBuffer()),
  );
  await deleteUserAvatarVariants(input.userId, extension);

  return `/api/account/avatar/${input.userId}?v=${Date.now()}`;
}

export async function getUserAvatar(userId: string) {
  const storage = await getFileStorage();

  for (const extension of avatarExtensions) {
    const storageKey = getAvatarStorageKey(userId, extension);
    const body = await storage.getItemRaw(storageKey);

    if (!body) {
      continue;
    }

    return {
      body: normalizeStorageBody(body),
      contentType: getAvatarContentType(storageKey),
    };
  }

  return null;
}

export async function canViewUserAvatar(input: {
  viewerId: string;
  viewerRole: string | null;
  targetUserId: string;
}) {
  if (input.viewerId === input.targetUserId) {
    return true;
  }

  if (isPlatformAdmin(input.viewerRole)) {
    return true;
  }

  const sharedOrganizationMembership = await db.member.findFirst({
    where: {
      userId: input.viewerId,
      organization: {
        members: {
          some: {
            userId: input.targetUserId,
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(sharedOrganizationMembership);
}
