import "server-only";

import { CohereClient } from "cohere-ai";

let cachedClient: CohereClient | null = null;

function readCohereApiKey() {
  const value = process.env.COHERE_API_KEY?.trim();
  if (!value) {
    throw new Error("COHERE_API_KEY is not set");
  }
  return value;
}

export function hasCohere(): boolean {
  return Boolean(process.env.COHERE_API_KEY?.trim());
}

function getCohereClient(): CohereClient {
  if (!cachedClient) {
    cachedClient = new CohereClient({ token: readCohereApiKey() });
  }
  return cachedClient;
}

export type RerankInput = {
  query: string;
  documents: string[];
  topN?: number;
  model?: string;
};

export type RerankOutput = {
  index: number;
  relevanceScore: number;
}[];

/**
 * Rerank documents by semantic relevance to query. Falls back to original order
 * when Cohere is not configured.
 */
export async function rerankDocuments(input: RerankInput): Promise<RerankOutput> {
  if (!hasCohere()) {
    return input.documents.map((_, i) => ({ index: i, relevanceScore: 0 }));
  }

  const client = getCohereClient();
  const response = await client.rerank({
    model: input.model ?? "rerank-multilingual-v3.0",
    query: input.query,
    documents: input.documents,
    topN: input.topN ?? input.documents.length,
  });

  return response.results.map((r) => ({
    index: r.index,
    relevanceScore: r.relevanceScore,
  }));
}
