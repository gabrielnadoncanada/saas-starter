import "server-only";

import {
  getEmailAccount,
  getValidAccessToken,
} from "@/features/email-agent/server/email-accounts";
import { db } from "@/lib/db/prisma";
import {
  buildRawMimeMessage,
  sendRawMessage,
} from "@/lib/email-agent/gmail-client";

export async function sendDraft(draftId: string): Promise<void> {
  const draft = await db.agentDraft.findFirst({
    where: { id: draftId },
    include: {
      thread: true,
      emailAccount: true,
    },
  });
  if (!draft) {
    throw new Error("Draft not found.");
  }
  if (draft.status === "SENT") return;

  const incoming = draft.replyToMessageId
    ? await db.emailMessage.findFirst({
        where: { id: draft.replyToMessageId },
      })
    : null;

  const account = await getEmailAccount(draft.emailAccountId);
  if (!account) {
    throw new Error("Email account not found.");
  }
  if (account.status !== "ACTIVE") {
    throw new Error(`Email account is ${account.status}.`);
  }

  const accessToken = await getValidAccessToken(account);
  const recipient =
    incoming?.fromAddress ?? draft.thread.participants.split(";")[0]?.trim();
  if (!recipient) {
    throw new Error("Could not determine recipient address.");
  }

  const raw = buildRawMimeMessage({
    from: account.email,
    to: recipient,
    subject: draft.subject,
    bodyText: draft.bodyText,
    inReplyTo: incoming?.inReplyTo ?? undefined,
    references: incoming?.inReplyTo ?? undefined,
  });

  try {
    const response = await sendRawMessage(
      accessToken,
      raw,
      draft.thread.providerThreadId,
    );

    await db.$transaction(async (tx) => {
      await tx.agentDraft.update({
        where: { id: draft.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          sentMessageId: response.id,
          errorMessage: null,
        },
      });
      await tx.emailMessage.create({
        data: {
          organizationId: draft.organizationId,
          emailAccountId: draft.emailAccountId,
          threadId: draft.threadId,
          providerMessageId: response.id,
          direction: "OUTGOING",
          fromAddress: account.email,
          toAddresses: recipient,
          subject: draft.subject,
          bodyText: draft.bodyText,
          internalDate: new Date(),
          inReplyTo: incoming?.inReplyTo ?? null,
        },
      });
      await tx.emailThread.update({
        where: { id: draft.threadId },
        data: {
          hasPendingDraft: false,
          lastMessageAt: new Date(),
        },
      });
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "send_failed";
    await db.agentDraft.update({
      where: { id: draft.id },
      data: { status: "FAILED", errorMessage: msg.slice(0, 1000) },
    });
    throw error;
  }
}
