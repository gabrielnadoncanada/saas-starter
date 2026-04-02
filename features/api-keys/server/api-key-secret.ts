import "server-only";

import { createHash, randomBytes } from "node:crypto";

const API_KEY_PREFIX = "ssk";

export function hashApiKey(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export function generateApiKeySecret() {
  const token = randomBytes(24).toString("base64url");
  return `${API_KEY_PREFIX}_${token}`;
}

export function buildApiKeyPrefix(secret: string) {
  const [, token = ""] = secret.split("_");
  return `${API_KEY_PREFIX}_${token.slice(0, 8)}`;
}
