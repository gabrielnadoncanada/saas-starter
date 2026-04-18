import "server-only";

import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { db } from "@/lib/db/prisma";
import {
  deleteStoredFile,
  saveStoredFile,
} from "@/lib/storage/storage-service";

export async function createKnowledgeDocument(params: {
  agentId: string | null;
  title: string;
  file: File;
}) {
  const membership = await requireActiveOrganizationMembership();
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const storedFile = await saveStoredFile({
    organizationId: membership.organizationId,
    uploadedByUserId: user.id,
    file: params.file,
  });

  return db.knowledgeDocument.create({
    data: {
      organizationId: membership.organizationId,
      agentId: params.agentId,
      storedFileId: storedFile.id,
      title: params.title,
      status: "PROCESSING",
      createdByUserId: user.id,
    },
  });
}

export async function deleteKnowledgeDocument(documentId: string) {
  const membership = await requireActiveOrganizationMembership();

  const doc = await db.knowledgeDocument.findFirst({
    where: { id: documentId },
    select: { id: true, storedFileId: true },
  });
  if (!doc) throw new Error("Document not found");

  await db.knowledgeDocument.delete({ where: { id: documentId } });

  if (doc.storedFileId) {
    try {
      await deleteStoredFile(doc.storedFileId, membership.organizationId);
    } catch {
      // Orphaned storage key is not critical; DB record is gone.
    }
  }
}

export async function listKnowledgeDocuments(agentId?: string) {
  await requireActiveOrganizationMembership();
  return db.knowledgeDocument.findMany({
    where: agentId ? { agentId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      storedFile: { select: { fileName: true, sizeBytes: true, contentType: true } },
      agent: { select: { id: true, name: true, slug: true } },
      _count: { select: { chunks: true } },
    },
  });
}
