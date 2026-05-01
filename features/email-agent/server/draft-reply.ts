import "server-only";

import { generateText } from "ai";

import { getEmailAccount } from "@/features/email-agent/server/email-accounts";
import { getAiModelInstance } from "@/lib/ai/get-model-instance";
import { defaultAiModelId } from "@/lib/ai/models";
import { db } from "@/lib/db/prisma";

const MAX_THREAD_HISTORY = 6;
const MAX_BODY_PREVIEW = 4000;

const SYSTEM_PROMPT_BASE = `You are an executive email assistant drafting replies on behalf of the account holder.

Rules:
- Match the tone and length of the incoming email. Most replies should be 1-4 sentences.
- Be helpful, direct, and human. Do not use markdown, bullet points, or headings.
- Never invent commitments, prices, schedules, or facts you can't verify from the thread or instructions.
- If the email needs information you do not have, write a brief reply saying you'll follow up, or ask one focused question.
- If the email is spam, marketing, automated notification, calendar invite, or otherwise does not warrant a reply, output exactly: SKIP_REPLY
- Sign with the provided signature when given. Otherwise sign with just the first name from the account holder's email.
- Output plain text only — no quoted text, no "On X wrote:" preamble. The mail client adds quoting automatically.`;

function buildSystemPrompt(input: {
  accountEmail: string;
  instructions: string | null;
  signature: string | null;
}): string {
  const parts = [SYSTEM_PROMPT_BASE];
  parts.push(`\nAccount holder email: ${input.accountEmail}`);
  if (input.instructions?.trim()) {
    parts.push(
      `\nAccount holder's instructions for the agent:\n${input.instructions.trim()}`,
    );
  }
  if (input.signature?.trim()) {
    parts.push(`\nSignature to append:\n${input.signature.trim()}`);
  }
  return parts.join("\n");
}

export type GenerateDraftInput = {
  accountId: string;
  threadId: string;
  incomingMessageId: string;
};

export async function generateDraftReply(input: GenerateDraftInput) {
  const account = await getEmailAccount(input.accountId);
  if (!account) {
    throw new Error("Email account not found.");
  }

  const thread = await db.emailThread.findFirst({
    where: { id: input.threadId },
    include: {
      messages: {
        orderBy: { internalDate: "asc" },
        take: MAX_THREAD_HISTORY,
      },
    },
  });
  if (!thread) {
    throw new Error("Email thread not found.");
  }
  const incoming = thread.messages.find((m) => m.id === input.incomingMessageId);
  if (!incoming) {
    throw new Error("Incoming message not found in thread.");
  }

  const conversation = thread.messages
    .map((m) => {
      const role = m.direction === "INCOMING" ? "Them" : "Me";
      return `--- ${role} (${m.fromAddress}, ${m.internalDate.toISOString()}) ---\n${m.bodyText.slice(0, MAX_BODY_PREVIEW)}`;
    })
    .join("\n\n");

  const userPrompt = `Subject: ${thread.subject}

Conversation so far:
${conversation}

Draft a reply to the most recent message from "Them". If no reply is warranted, output exactly: SKIP_REPLY`;

  const { model } = getAiModelInstance(defaultAiModelId);

  const result = await generateText({
    model,
    system: buildSystemPrompt({
      accountEmail: account.email,
      instructions: account.agentInstructions,
      signature: account.signature,
    }),
    prompt: userPrompt,
  });

  const draftBody = result.text.trim();
  if (!draftBody || draftBody === "SKIP_REPLY") {
    return null;
  }

  const subject = thread.subject.toLowerCase().startsWith("re:")
    ? thread.subject
    : `Re: ${thread.subject}`;

  const draft = await db.agentDraft.create({
    data: {
      organizationId: account.organizationId,
      emailAccountId: account.id,
      threadId: thread.id,
      replyToMessageId: incoming.id,
      subject: subject.slice(0, 500),
      bodyText: draftBody,
      status: "PENDING",
      modelId: defaultAiModelId,
    },
  });

  await db.emailThread.update({
    where: { id: thread.id },
    data: { hasPendingDraft: true },
  });

  return draft;
}
