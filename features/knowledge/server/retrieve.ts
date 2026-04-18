import "server-only";

import { embedText, toPgVectorLiteral } from "@/lib/ai/embeddings";
import { rerankDocuments } from "@/lib/ai/providers/cohere";
import { db } from "@/lib/db/prisma";
import { runAsAdmin } from "@/lib/db/tenant-scope";

export type RetrievedChunk = {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  similarity: number;
  rerankScore?: number;
};

type RawChunkRow = {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  similarity: number;
};

/**
 * Retrieve top-K knowledge chunks by semantic similarity, optionally scoped to
 * a single agent. Falls back to returning no results if the embeddings provider
 * is not configured. When Cohere is configured, reranks the top 3*K candidates
 * and returns the top K; otherwise returns by raw cosine distance.
 */
export async function retrieveRelevantChunks(params: {
  organizationId: string;
  agentId?: string;
  query: string;
  topK?: number;
  candidatePool?: number;
}): Promise<RetrievedChunk[]> {
  const topK = params.topK ?? 5;
  const poolSize = Math.max(topK, params.candidatePool ?? topK * 3);

  let queryEmbedding: number[];
  try {
    queryEmbedding = await embedText(params.query);
  } catch {
    return [];
  }

  const vectorLiteral = toPgVectorLiteral(queryEmbedding);

  return runAsAdmin(async () => {
    const rows: RawChunkRow[] = params.agentId
      ? await db.$queryRaw<RawChunkRow[]>`
          SELECT
            c."id",
            c."documentId",
            d."title" AS "documentTitle",
            c."content",
            1 - (c."embedding" <=> ${vectorLiteral}::vector) AS "similarity"
          FROM "KnowledgeChunk" c
          JOIN "KnowledgeDocument" d ON d."id" = c."documentId"
          WHERE
            d."organizationId" = ${params.organizationId}
            AND d."status" = 'READY'
            AND d."agentId" = ${params.agentId}
            AND c."embedding" IS NOT NULL
          ORDER BY c."embedding" <=> ${vectorLiteral}::vector
          LIMIT ${poolSize}
        `
      : await db.$queryRaw<RawChunkRow[]>`
          SELECT
            c."id",
            c."documentId",
            d."title" AS "documentTitle",
            c."content",
            1 - (c."embedding" <=> ${vectorLiteral}::vector) AS "similarity"
          FROM "KnowledgeChunk" c
          JOIN "KnowledgeDocument" d ON d."id" = c."documentId"
          WHERE
            d."organizationId" = ${params.organizationId}
            AND d."status" = 'READY'
            AND c."embedding" IS NOT NULL
          ORDER BY c."embedding" <=> ${vectorLiteral}::vector
          LIMIT ${poolSize}
        `;

    if (rows.length === 0) return [];

    const reranked = await rerankDocuments({
      query: params.query,
      documents: rows.map((r) => r.content),
      topN: topK,
    });

    if (reranked.length > 0 && reranked[0].relevanceScore > 0) {
      return reranked.slice(0, topK).map((r) => {
        const row = rows[r.index];
        return {
          chunkId: row.id,
          documentId: row.documentId,
          documentTitle: row.documentTitle,
          content: row.content,
          similarity: row.similarity,
          rerankScore: r.relevanceScore,
        };
      });
    }

    return rows.slice(0, topK).map((row) => ({
      chunkId: row.id,
      documentId: row.documentId,
      documentTitle: row.documentTitle,
      content: row.content,
      similarity: row.similarity,
    }));
  });
}

/**
 * Retrieve corrections most similar to a user query, used to inject few-shot
 * examples into the system prompt. Only returns corrections flagged
 * useAsExample.
 */
export async function retrieveSimilarCorrections(params: {
  organizationId: string;
  agentId: string;
  query: string;
  topK?: number;
  minSimilarity?: number;
}): Promise<
  Array<{
    userMessage: string;
    correctedMessage: string;
    similarity: number;
  }>
> {
  const topK = params.topK ?? 3;
  const minSimilarity = params.minSimilarity ?? 0.75;

  let queryEmbedding: number[];
  try {
    queryEmbedding = await embedText(params.query);
  } catch {
    return [];
  }

  const vectorLiteral = toPgVectorLiteral(queryEmbedding);

  return runAsAdmin(async () => {
    const rows = await db.$queryRaw<
      Array<{
        userMessage: string;
        correctedMessage: string;
        similarity: number;
      }>
    >`
      SELECT
        "userMessage",
        "correctedMessage",
        1 - ("userMessageEmbedding" <=> ${vectorLiteral}::vector) AS "similarity"
      FROM "Correction"
      WHERE
        "organizationId" = ${params.organizationId}
        AND "agentId" = ${params.agentId}
        AND "useAsExample" = true
        AND "userMessageEmbedding" IS NOT NULL
      ORDER BY "userMessageEmbedding" <=> ${vectorLiteral}::vector
      LIMIT ${topK}
    `;

    return rows.filter((r) => r.similarity >= minSimilarity);
  });
}
