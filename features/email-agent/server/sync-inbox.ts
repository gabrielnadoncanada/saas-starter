import "server-only";

import type { EmailAccount } from "@prisma/client";

import { generateDraftReply } from "@/features/email-agent/server/draft-reply";
import {
  getValidAccessToken,
  markAccountError,
  updateAccountSyncCursor,
} from "@/features/email-agent/server/email-accounts";
import { sendDraft } from "@/features/email-agent/server/send-reply";
import { db } from "@/lib/db/prisma";
import {
  extractPlainText,
  findHeader,
  getMessage,
  getProfile,
  type GmailMessage,
  listMessages,
} from "@/lib/email-agent/gmail-client";

const SYNC_QUERY = "in:inbox -category:promotions -category:social newer_than:2d";
const MAX_THREADS_PER_SYNC = 15;

type SyncReport = {
  accountEmail: string;
  newMessages: number;
  newDrafts: number;
  autoSent: number;
  errors: string[];
};

export async function syncEmailAccount(
  account: EmailAccount,
): Promise<SyncReport> {
  const report: SyncReport = {
    accountEmail: account.email,
    newMessages: 0,
    newDrafts: 0,
    autoSent: 0,
    errors: [],
  };

  let accessToken: string;
  try {
    accessToken = await getValidAccessToken(account);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "token_refresh_failed";
    await markAccountError(account.id, msg);
    report.errors.push(msg);
    return report;
  }

  let listing: Awaited<ReturnType<typeof listMessages>>;
  try {
    listing = await listMessages(accessToken, {
      query: SYNC_QUERY,
      maxResults: MAX_THREADS_PER_SYNC,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "list_failed";
    await markAccountError(account.id, msg);
    report.errors.push(msg);
    return report;
  }

  const messageIds = (listing.messages ?? []).map((m) => m.id);

  for (const messageId of messageIds) {
    try {
      const existing = await db.emailMessage.findFirst({
        where: {
          emailAccountId: account.id,
          providerMessageId: messageId,
        },
        select: { id: true },
      });
      if (existing) continue;

      const fullMessage = await getMessage(accessToken, messageId);
      const result = await ingestGmailMessage({ account, message: fullMessage });
      if (!result) continue;

      report.newMessages += 1;

      if (result.shouldDraft) {
        const draft = await generateDraftReply({
          accountId: account.id,
          threadId: result.threadId,
          incomingMessageId: result.messageId,
        }).catch((e) => {
          report.errors.push(
            `draft_failed:${e instanceof Error ? e.message : String(e)}`,
          );
          return null;
        });
        if (draft) {
          report.newDrafts += 1;
          if (account.autoSendEnabled) {
            try {
              await sendDraft(draft.id);
              report.autoSent += 1;
            } catch (e) {
              report.errors.push(
                `auto_send_failed:${e instanceof Error ? e.message : String(e)}`,
              );
            }
          }
        }
      }
    } catch (error) {
      report.errors.push(
        error instanceof Error ? error.message : "ingest_failed",
      );
    }
  }

  let historyId: string | undefined;
  try {
    const profile = await getProfile(accessToken);
    historyId = profile.historyId;
  } catch {
    // non-fatal
  }
  await updateAccountSyncCursor({
    emailAccountId: account.id,
    historyId: historyId ?? null,
    lastSyncedAt: new Date(),
  });

  return report;
}

type IngestResult = {
  threadId: string;
  messageId: string;
  shouldDraft: boolean;
};

async function ingestGmailMessage(input: {
  account: EmailAccount;
  message: GmailMessage;
}): Promise<IngestResult | null> {
  const { account, message } = input;
  const headers = message.payload?.headers;
  const fromAddress = findHeader(headers, "From") ?? "";
  const toAddresses = findHeader(headers, "To") ?? "";
  const subject = findHeader(headers, "Subject") ?? "(no subject)";
  const inReplyTo = findHeader(headers, "In-Reply-To") ?? null;
  const messageIdHeader = findHeader(headers, "Message-ID") ?? null;
  const internalDate = message.internalDate
    ? new Date(parseInt(message.internalDate, 10))
    : new Date();

  const bodyText = extractPlainText(message.payload).slice(0, 50_000);

  const isFromSelf = fromAddress
    .toLowerCase()
    .includes(account.email.toLowerCase());
  const direction = isFromSelf ? "OUTGOING" : "INCOMING";

  const thread = await db.emailThread.upsert({
    where: {
      emailAccountId_providerThreadId: {
        emailAccountId: account.id,
        providerThreadId: message.threadId,
      },
    },
    create: {
      organizationId: account.organizationId,
      emailAccountId: account.id,
      providerThreadId: message.threadId,
      subject: subject.slice(0, 500),
      snippet: message.snippet ?? null,
      participants: [fromAddress, toAddresses].filter(Boolean).join("; "),
      lastMessageAt: internalDate,
    },
    update: {
      snippet: message.snippet ?? undefined,
      lastMessageAt: internalDate,
    },
  });

  const stored = await db.emailMessage.create({
    data: {
      organizationId: account.organizationId,
      emailAccountId: account.id,
      threadId: thread.id,
      providerMessageId: message.id,
      direction,
      fromAddress: fromAddress.slice(0, 320),
      toAddresses: toAddresses.slice(0, 4000),
      subject: subject.slice(0, 500),
      bodyText,
      internalDate,
      inReplyTo: messageIdHeader?.slice(0, 320) ?? inReplyTo?.slice(0, 320) ?? null,
    },
  });

  const shouldDraft =
    direction === "INCOMING" && (await shouldDraftForThread(thread.id));

  return {
    threadId: thread.id,
    messageId: stored.id,
    shouldDraft,
  };
}

async function shouldDraftForThread(threadId: string): Promise<boolean> {
  const pending = await db.agentDraft.findFirst({
    where: { threadId, status: { in: ["PENDING", "APPROVED"] } },
    select: { id: true },
  });
  return !pending;
}
