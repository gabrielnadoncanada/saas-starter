"use server";

import { revalidatePath } from "next/cache";

import {
  createKnowledgeDocument,
  deleteKnowledgeDocument,
} from "@/features/knowledge/server/document-mutations";
import { ingestDocument } from "@/features/knowledge/server/ingest-document";

const ALLOWED_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/json",
  "text/csv",
  "text/html",
]);

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadKnowledgeDocumentAction(formData: FormData): Promise<{
  id: string;
}> {
  const file = formData.get("file");
  const title = String(formData.get("title") ?? "").trim();
  const agentId = (formData.get("agentId") as string | null) || null;

  if (!(file instanceof File)) {
    throw new Error("File is required");
  }
  if (!title) {
    throw new Error("Title is required");
  }
  if (file.size === 0) {
    throw new Error("File is empty");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File too large (max 10 MB)");
  }
  if (!ALLOWED_TYPES.has(file.type) && !file.name.match(/\.(txt|md|json|csv|html)$/i)) {
    throw new Error(`Unsupported file type: ${file.type || file.name}`);
  }

  const doc = await createKnowledgeDocument({ agentId, title, file });

  try {
    await ingestDocument(doc.id);
  } catch (error) {
    console.error("[knowledge] ingest failed", error);
  }

  revalidatePath(`/agents`);
  return { id: doc.id };
}

export async function deleteKnowledgeDocumentAction(input: { documentId: string }) {
  await deleteKnowledgeDocument(input.documentId);
  revalidatePath(`/agents`);
}

export async function reingestKnowledgeDocumentAction(input: { documentId: string }) {
  await ingestDocument(input.documentId);
  revalidatePath(`/agents`);
}
