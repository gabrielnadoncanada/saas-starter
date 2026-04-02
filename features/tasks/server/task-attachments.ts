import "server-only";

import type { Prisma } from "@prisma/client";

import { saveStoredFile, deleteStoredFile } from "@/features/files/server/storage-service";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organization-membership";
import { db } from "@/shared/lib/db/prisma";

const MAX_TASK_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const allowedTaskAttachmentTypes = new Set([
  "application/pdf",
  "application/zip",
  "application/json",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "text/markdown",
  "text/plain",
]);

const taskAttachmentInclude = {
  storedFile: {
    select: {
      id: true,
      fileName: true,
      contentType: true,
      sizeBytes: true,
      createdAt: true,
    },
  },
} satisfies Prisma.TaskAttachmentInclude;

function validateTaskAttachmentFile(file: File) {
  if (!file.name.trim()) {
    throw new Error("Attachment name is required.");
  }

  if (!allowedTaskAttachmentTypes.has(file.type)) {
    throw new Error("This file type is not supported.");
  }

  if (file.size <= 0) {
    throw new Error("Attachment is empty.");
  }

  if (file.size > MAX_TASK_ATTACHMENT_BYTES) {
    throw new Error("Attachments must be 10 MB or smaller.");
  }
}

export async function listTaskAttachments(taskId: number) {
  const membership = await requireActiveOrganizationMembership();

  return db.taskAttachment.findMany({
    where: {
      taskId,
      task: {
        organizationId: membership.organizationId,
      },
    },
    orderBy: { createdAt: "desc" },
    include: taskAttachmentInclude,
  });
}

export async function createTaskAttachment(taskId: number, file: File, userId: string) {
  const membership = await requireActiveOrganizationMembership();
  validateTaskAttachmentFile(file);

  const task = await db.task.findFirst({
    where: {
      id: taskId,
      organizationId: membership.organizationId,
    },
    select: { id: true },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const storedFile = await saveStoredFile({
    organizationId: membership.organizationId,
    uploadedByUserId: userId,
    file,
  });

  return db.taskAttachment.create({
    data: {
      taskId: task.id,
      storedFileId: storedFile.id,
    },
    include: taskAttachmentInclude,
  });
}

export async function removeTaskAttachment(attachmentId: string) {
  const membership = await requireActiveOrganizationMembership();

  const attachment = await db.taskAttachment.findFirst({
    where: {
      id: attachmentId,
      task: {
        organizationId: membership.organizationId,
      },
    },
    include: taskAttachmentInclude,
  });

  if (!attachment) {
    throw new Error("Attachment not found");
  }

  await deleteStoredFile(attachment.storedFileId, membership.organizationId);

  return attachment;
}
