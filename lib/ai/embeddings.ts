import "server-only";

import { embed, embedMany } from "ai";

import {
  getOpenAiEmbeddingModel,
  hasOpenAi,
} from "@/lib/ai/providers/openai";

export const EMBEDDING_DIMENSION = 1536;

export function hasEmbeddingsProvider(): boolean {
  return hasOpenAi();
}

export async function embedText(text: string): Promise<number[]> {
  const model = getOpenAiEmbeddingModel("text-embedding-3-small");
  const { embedding } = await embed({ model, value: text });
  return embedding;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const model = getOpenAiEmbeddingModel("text-embedding-3-small");
  const { embeddings } = await embedMany({ model, values: texts });
  return embeddings;
}

/**
 * Format a number[] as a pgvector-compatible string literal (e.g. "[0.1,0.2,...]").
 * Use when passing embeddings via $executeRawUnsafe with placeholders.
 */
export function toPgVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
