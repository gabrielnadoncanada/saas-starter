import "server-only";

import type { EmailAccount } from "@prisma/client";

import { db } from "@/lib/db/prisma";
import {
  type GoogleTokenResponse,
  refreshAccessToken,
} from "@/lib/email-agent/google-oauth";
import { decryptToken, encryptToken } from "@/lib/email-agent/token-crypto";

const REFRESH_LEEWAY_MS = 60_000;

export async function upsertEmailAccount(input: {
  organizationId: string;
  connectedByUserId: string;
  email: string;
  tokens: GoogleTokenResponse;
}): Promise<EmailAccount> {
  const { tokens } = input;
  if (!tokens.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Revoke prior access at https://myaccount.google.com/permissions and try connecting again.",
    );
  }
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  return db.emailAccount.upsert({
    where: {
      organizationId_email: {
        organizationId: input.organizationId,
        email: input.email,
      },
    },
    create: {
      organizationId: input.organizationId,
      connectedByUserId: input.connectedByUserId,
      provider: "GOOGLE",
      email: input.email,
      status: "ACTIVE",
      accessToken: encryptToken(tokens.access_token),
      refreshToken: encryptToken(tokens.refresh_token),
      tokenExpiresAt: expiresAt,
      scope: tokens.scope ?? null,
    },
    update: {
      status: "ACTIVE",
      accessToken: encryptToken(tokens.access_token),
      refreshToken: encryptToken(tokens.refresh_token),
      tokenExpiresAt: expiresAt,
      scope: tokens.scope ?? null,
      lastError: null,
      connectedByUserId: input.connectedByUserId,
    },
  });
}

export async function listEmailAccounts(): Promise<EmailAccount[]> {
  return db.emailAccount.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getEmailAccount(
  emailAccountId: string,
): Promise<EmailAccount | null> {
  return db.emailAccount.findFirst({ where: { id: emailAccountId } });
}

export async function disconnectEmailAccount(
  emailAccountId: string,
): Promise<void> {
  await db.emailAccount.update({
    where: { id: emailAccountId },
    data: { status: "DISCONNECTED" },
  });
}

export async function markAccountError(
  emailAccountId: string,
  error: string,
): Promise<void> {
  await db.emailAccount.update({
    where: { id: emailAccountId },
    data: { status: "ERROR", lastError: error.slice(0, 1000) },
  });
}

/**
 * Returns a valid (decrypted) Gmail access token, refreshing if needed.
 * Persists refreshed tokens.
 */
export async function getValidAccessToken(
  account: EmailAccount,
): Promise<string> {
  const expiresAt = account.tokenExpiresAt.getTime();
  if (expiresAt - REFRESH_LEEWAY_MS > Date.now()) {
    return decryptToken(account.accessToken);
  }
  const refreshToken = decryptToken(account.refreshToken);
  const refreshed = await refreshAccessToken(refreshToken);
  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
  await db.emailAccount.update({
    where: { id: account.id },
    data: {
      accessToken: encryptToken(refreshed.access_token),
      tokenExpiresAt: newExpiresAt,
      scope: refreshed.scope ?? account.scope,
      status: "ACTIVE",
      lastError: null,
    },
  });
  return refreshed.access_token;
}

export async function updateAccountSettings(input: {
  emailAccountId: string;
  autoSendEnabled?: boolean;
  agentInstructions?: string | null;
  signature?: string | null;
}): Promise<void> {
  await db.emailAccount.update({
    where: { id: input.emailAccountId },
    data: {
      ...(input.autoSendEnabled !== undefined
        ? { autoSendEnabled: input.autoSendEnabled }
        : {}),
      ...(input.agentInstructions !== undefined
        ? { agentInstructions: input.agentInstructions || null }
        : {}),
      ...(input.signature !== undefined
        ? { signature: input.signature || null }
        : {}),
    },
  });
}

export async function updateAccountSyncCursor(input: {
  emailAccountId: string;
  historyId: string | null;
  lastSyncedAt: Date;
}): Promise<void> {
  await db.emailAccount.update({
    where: { id: input.emailAccountId },
    data: {
      historyId: input.historyId,
      lastSyncedAt: input.lastSyncedAt,
    },
  });
}
