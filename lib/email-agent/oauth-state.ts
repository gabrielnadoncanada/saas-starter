import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const STATE_TTL_MS = 10 * 60 * 1000;

type OAuthStatePayload = {
  organizationId: string;
  userId: string;
  nonce: string;
  iat: number;
};

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    throw new Error("AUTH_SECRET must be set to sign OAuth state.");
  }
  return s;
}

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

function sign(payload: string): string {
  return base64UrlEncode(
    createHmac("sha256", getSecret()).update(payload).digest(),
  );
}

export function signOAuthState(input: {
  organizationId: string;
  userId: string;
}): string {
  const body: OAuthStatePayload = {
    organizationId: input.organizationId,
    userId: input.userId,
    nonce: base64UrlEncode(
      Buffer.from(crypto.getRandomValues(new Uint8Array(12))),
    ),
    iat: Date.now(),
  };
  const encoded = base64UrlEncode(Buffer.from(JSON.stringify(body), "utf8"));
  return `${encoded}.${sign(encoded)}`;
}

export function verifyOAuthState(state: string): OAuthStatePayload {
  const [encoded, signature] = state.split(".");
  if (!encoded || !signature) {
    throw new Error("Invalid OAuth state format.");
  }
  const expected = sign(encoded);
  const a = base64UrlDecode(signature);
  const b = base64UrlDecode(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid OAuth state signature.");
  }
  const payload = JSON.parse(
    base64UrlDecode(encoded).toString("utf8"),
  ) as OAuthStatePayload;
  if (Date.now() - payload.iat > STATE_TTL_MS) {
    throw new Error("OAuth state has expired.");
  }
  return payload;
}
