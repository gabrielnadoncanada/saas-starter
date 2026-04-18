import "server-only";

import type { UIMessage } from "ai";

import { getPublicConversation } from "@/features/agents/server/public-conversations";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { embedText, toPgVectorLiteral } from "@/lib/ai/embeddings";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { db } from "@/lib/db/prisma";
import { runInTenantScope } from "@/lib/db/tenant-scope";

/**
 * Creates a human correction for a specific assistant message. Computes an
 * embedding for the *user* message that triggered it so the prompt builder
 * can retrieve similar cases and inject them as few-shot examples. Falls back
 * silently if the embedding provider is not configured — the correction is
 * still saved and will be usable once embeddings come online.
 */
export async function createCorrection(params: {
  conversationId: string;
  messageId: string;
  correctedMessage: string;
  useAsExample: boolean;
}) {
  const membership = await requireActiveOrganizationMembership();
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const convo = await getPublicConversation(
    membership.organizationId,
    params.conversationId,
  );
  if (!convo) throw new Error("Conversation not found");

  const messages = Array.isArray(convo.messagesJson)
    ? (convo.messagesJson as unknown as UIMessage[])
    : [];
  const assistantIndex = messages.findIndex((m) => m.id === params.messageId);
  if (assistantIndex === -1) {
    throw new Error("Message not found in conversation");
  }

  const assistantMessage = messages[assistantIndex];
  if (assistantMessage.role !== "assistant") {
    throw new Error("Corrections can only target assistant messages");
  }

  const originalText = (assistantMessage.parts ?? [])
    .filter((p) => p.type === "text")
    .map((p) => ("text" in p ? p.text : ""))
    .join("");

  let userText = "";
  for (let i = assistantIndex - 1; i >= 0; i -= 1) {
    if (messages[i].role !== "user") continue;
    userText = (messages[i].parts ?? [])
      .filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join("");
    if (userText) break;
  }

  let embeddingLiteral: string | null = null;
  try {
    const vec = await embedText(userText || params.correctedMessage);
    embeddingLiteral = toPgVectorLiteral(vec);
  } catch {
    embeddingLiteral = null;
  }

  return runInTenantScope(membership.organizationId, async () => {
    const id = `cor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    if (embeddingLiteral) {
      await db.$executeRaw`
        INSERT INTO "Correction" (
          "id", "organizationId", "agentId", "conversationId", "messageId",
          "userMessage", "originalMessage", "correctedMessage",
          "userMessageEmbedding", "useAsExample", "createdByUserId", "createdAt"
        ) VALUES (
          ${id},
          ${membership.organizationId},
          ${convo.agentId},
          ${params.conversationId},
          ${params.messageId},
          ${userText},
          ${originalText},
          ${params.correctedMessage},
          ${embeddingLiteral}::vector,
          ${params.useAsExample},
          ${user.id},
          NOW()
        )
      `;
    } else {
      await db.$executeRaw`
        INSERT INTO "Correction" (
          "id", "organizationId", "agentId", "conversationId", "messageId",
          "userMessage", "originalMessage", "correctedMessage",
          "useAsExample", "createdByUserId", "createdAt"
        ) VALUES (
          ${id},
          ${membership.organizationId},
          ${convo.agentId},
          ${params.conversationId},
          ${params.messageId},
          ${userText},
          ${originalText},
          ${params.correctedMessage},
          ${params.useAsExample},
          ${user.id},
          NOW()
        )
      `;
    }

    return { id };
  });
}

export async function listCorrections(agentId: string, take = 50) {
  await requireActiveOrganizationMembership();
  return db.correction.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function toggleCorrectionExample(correctionId: string, useAsExample: boolean) {
  await requireActiveOrganizationMembership();
  await db.correction.updateMany({
    where: { id: correctionId },
    data: { useAsExample },
  });
}

export async function deleteCorrection(correctionId: string) {
  await requireActiveOrganizationMembership();
  await db.correction.deleteMany({ where: { id: correctionId } });
}
