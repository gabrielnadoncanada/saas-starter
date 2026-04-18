import "server-only";

import { Prisma } from "@prisma/client";

import { chunkText, extractTextFromBuffer } from "@/features/knowledge/server/chunker";
import { embedTexts, toPgVectorLiteral } from "@/lib/ai/embeddings";
import { db } from "@/lib/db/prisma";
import { runAsAdmin } from "@/lib/db/tenant-scope";
import { readStoredFileBody } from "@/lib/storage/storage-service";

export type IngestResult = {
  documentId: string;
  chunkCount: number;
  tokenCount: number;
};

const EMBED_BATCH_SIZE = 96;

/**
 * Ingest a knowledge document: extract text, chunk, embed, insert chunks.
 * Called in two contexts:
 * - Admin action: authenticated org member uploads a file.
 * - Background: future queue worker.
 *
 * Uses runAsAdmin because we write raw SQL for pgvector columns and the
 * tenant-scope extension can't rewrite raw queries. The caller is responsible
 * for confirming the document belongs to the right org before invoking this.
 */
export async function ingestDocument(documentId: string): Promise<IngestResult> {
  return runAsAdmin(async () => {
    const doc = await db.knowledgeDocument.findUnique({
      where: { id: documentId },
      include: { storedFile: true },
    });
    if (!doc) throw new Error("Knowledge document not found");
    if (!doc.storedFile) throw new Error("Stored file missing for document");

    try {
      await db.knowledgeDocument.update({
        where: { id: documentId },
        data: { status: "PROCESSING", errorMessage: null },
      });

      const body = await readStoredFileBody(doc.storedFile.storageKey);
      const text = extractTextFromBuffer(body, doc.storedFile.contentType);
      const chunks = chunkText(text);

      if (chunks.length === 0) {
        throw new Error("No content extracted from file");
      }

      await db.knowledgeChunk.deleteMany({ where: { documentId } });

      let totalTokens = 0;

      for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
        const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
        const embeddings = await embedTexts(batch.map((c) => c.content));

        for (let j = 0; j < batch.length; j += 1) {
          const chunk = batch[j];
          const vector = toPgVectorLiteral(embeddings[j]);
          totalTokens += chunk.tokenEstimate;

          await db.$executeRaw`
            INSERT INTO "KnowledgeChunk" (
              "id", "documentId", "chunkIndex", "content", "embedding",
              "metadata", "tokenCount", "createdAt"
            ) VALUES (
              ${"kc_" + documentId.slice(-8) + "_" + chunk.index + "_" + Date.now()},
              ${documentId},
              ${chunk.index},
              ${chunk.content},
              ${vector}::vector,
              ${Prisma.JsonNull},
              ${chunk.tokenEstimate},
              NOW()
            )
          `;
        }
      }

      await db.knowledgeDocument.update({
        where: { id: documentId },
        data: {
          status: "READY",
          chunkCount: chunks.length,
          tokenCount: totalTokens,
        },
      });

      return {
        documentId,
        chunkCount: chunks.length,
        tokenCount: totalTokens,
      };
    } catch (error) {
      await db.knowledgeDocument.update({
        where: { id: documentId },
        data: {
          status: "ERROR",
          errorMessage:
            error instanceof Error ? error.message : "Unknown ingestion error",
        },
      });
      throw error;
    }
  });
}
