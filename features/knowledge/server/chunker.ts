import "server-only";

export type TextChunk = {
  content: string;
  index: number;
  tokenEstimate: number;
};

/**
 * Rough token estimate: ~4 chars per token for English, slightly more for FR.
 * Good enough to budget embedding calls without a tokenizer dependency.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.8);
}

const DEFAULT_CHUNK_SIZE_CHARS = 1400;
const DEFAULT_CHUNK_OVERLAP_CHARS = 200;

/**
 * Split text into paragraphs, then greedily pack paragraphs into chunks up to
 * targetSizeChars with the given overlap at boundaries. Keeps paragraphs
 * intact when possible; falls back to sentence-splitting oversized paragraphs.
 */
export function chunkText(
  raw: string,
  opts?: { targetSizeChars?: number; overlapChars?: number },
): TextChunk[] {
  const targetSize = opts?.targetSizeChars ?? DEFAULT_CHUNK_SIZE_CHARS;
  const overlap = Math.max(0, Math.min(opts?.overlapChars ?? DEFAULT_CHUNK_OVERLAP_CHARS, targetSize - 1));

  const normalized = raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!normalized) return [];

  const paragraphs = normalized.split(/\n{2,}/);

  const units: string[] = [];
  for (const p of paragraphs) {
    if (p.length <= targetSize) {
      units.push(p);
      continue;
    }
    const sentences = p.split(/(?<=[.!?])\s+/);
    let buf = "";
    for (const s of sentences) {
      if ((buf + " " + s).length > targetSize && buf) {
        units.push(buf.trim());
        buf = s;
      } else {
        buf = buf ? `${buf} ${s}` : s;
      }
    }
    if (buf) units.push(buf.trim());
  }

  const chunks: TextChunk[] = [];
  let current = "";
  let index = 0;

  const flush = () => {
    const trimmed = current.trim();
    if (!trimmed) return;
    chunks.push({
      content: trimmed,
      index: index++,
      tokenEstimate: estimateTokens(trimmed),
    });
  };

  for (const unit of units) {
    if (!current) {
      current = unit;
      continue;
    }
    const combined = `${current}\n\n${unit}`;
    if (combined.length <= targetSize) {
      current = combined;
    } else {
      flush();
      const tail = overlap > 0 ? current.slice(-overlap) : "";
      current = tail ? `${tail}\n\n${unit}` : unit;
    }
  }
  flush();

  return chunks;
}

export function extractTextFromBuffer(
  buffer: Buffer | Uint8Array,
  contentType: string,
): string {
  const ct = contentType.toLowerCase();
  const asBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  if (
    ct.startsWith("text/") ||
    ct === "application/json" ||
    ct === "application/xml" ||
    ct.endsWith("/markdown") ||
    ct.endsWith("+xml") ||
    ct === "application/yaml"
  ) {
    return asBuffer.toString("utf8");
  }
  // PDF and DOCX support intentionally deferred — users can paste text or
  // upload .txt/.md for v1. Returning the raw bytes as utf-8 would produce
  // garbage; better to fail loudly so the admin knows to convert first.
  if (ct === "application/pdf") {
    throw new Error("PDF ingestion not supported yet. Upload .txt or .md for now.");
  }
  throw new Error(`Unsupported content type: ${contentType}`);
}
